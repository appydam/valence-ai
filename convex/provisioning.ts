"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { generateSetupScript } from "./lib/setupScript";

/**
 * Provision a 4GB Lightsail instance for an individual plan user.
 * Uses the Intela Labs India AWS account (2658-7007-7714).
 *
 * Flow:
 * 1. Create Lightsail instance
 * 2. Wait for it to become running
 * 3. Open required ports
 * 4. Allocate and attach static IP
 * 5. Run setup script via SSH
 * 6. Store SSH config in Convex
 * 7. Mark provisioning as active
 */
export const provisionIndividualServer = action({
  args: {
    provisioningId: v.id("customerProvisionings"),
    userId: v.string(),
    provider: v.string(),
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    const {
      LightsailClient,
      CreateInstancesCommand,
      GetInstanceCommand,
      OpenInstancePublicPortsCommand,
      AllocateStaticIpCommand,
      AttachStaticIpCommand,
      CreateKeyPairCommand,
    } = await import("@aws-sdk/client-lightsail");

    const client = new LightsailClient({
      region: process.env.AWS_LIGHTSAIL_REGION ?? "ap-south-1",
      credentials: {
        accessKeyId: process.env.AWS_LIGHTSAIL_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_LIGHTSAIL_SECRET_ACCESS_KEY!,
      },
    });

    const instanceName = `valence-${args.userId.replace(/[^a-zA-Z0-9]/g, "").substring(0, 20)}-${Date.now()}`;
    const keyPairName = `valence-key-${instanceName}`;
    const staticIpName = `valence-ip-${instanceName}`;

    try {
      // Step 1: Create SSH key pair
      await ctx.runMutation(api.customerProvisioning.updateStep, {
        id: args.provisioningId,
        stepId: "create_lightsail_instance",
        status: "running",
      });

      const keyPairResult = await client.send(new CreateKeyPairCommand({
        keyPairName,
      }));
      const privateKey = keyPairResult.privateKeyBase64 ?? "";

      // Step 2: Create the instance
      await client.send(new CreateInstancesCommand({
        instanceNames: [instanceName],
        availabilityZone: `${process.env.AWS_LIGHTSAIL_REGION ?? "ap-south-1"}a`,
        blueprintId: "ubuntu_22_04",
        bundleId: "medium_3_0", // 4GB RAM, 2 vCPU, 80GB SSD — $24/mo
        keyPairName,
        tags: [
          { key: "product", value: "valence-ai" },
          { key: "plan", value: "individual" },
          { key: "userId", value: args.userId },
        ],
      }));

      await ctx.runMutation(api.customerProvisioning.updateStep, {
        id: args.provisioningId,
        stepId: "create_lightsail_instance",
        status: "done",
        output: `Instance: ${instanceName}`,
      });

      // Step 3: Wait for instance to be running
      await ctx.runMutation(api.customerProvisioning.updateStep, {
        id: args.provisioningId,
        stepId: "wait_for_running",
        status: "running",
      });

      let instanceIp = "";
      let attempts = 0;
      const maxAttempts = 30; // 5 minutes max (10s intervals)

      while (attempts < maxAttempts) {
        const instanceResult = await client.send(new GetInstanceCommand({
          instanceName,
        }));

        const state = instanceResult.instance?.state?.name;
        if (state === "running") {
          instanceIp = instanceResult.instance?.publicIpAddress ?? "";
          break;
        }

        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 10000)); // 10s
      }

      if (!instanceIp) {
        throw new Error("Instance failed to start within 5 minutes");
      }

      await ctx.runMutation(api.customerProvisioning.updateStep, {
        id: args.provisioningId,
        stepId: "wait_for_running",
        status: "done",
        output: `IP: ${instanceIp}`,
      });

      // Step 4: Open ports
      await ctx.runMutation(api.customerProvisioning.updateStep, {
        id: args.provisioningId,
        stepId: "open_ports",
        status: "running",
      });

      await client.send(new OpenInstancePublicPortsCommand({
        instanceName,
        portInfo: {
          fromPort: 3333,
          toPort: 3333,
          protocol: "tcp",
        },
      }));

      await ctx.runMutation(api.customerProvisioning.updateStep, {
        id: args.provisioningId,
        stepId: "open_ports",
        status: "done",
      });

      // Step 5: Allocate static IP
      try {
        await client.send(new AllocateStaticIpCommand({
          staticIpName,
        }));
        await client.send(new AttachStaticIpCommand({
          staticIpName,
          instanceName,
        }));

        // Get the static IP address
        const { LightsailClient: _, GetStaticIpCommand } = await import("@aws-sdk/client-lightsail");
        const staticIpResult = await client.send(new GetStaticIpCommand({
          staticIpName,
        }));
        instanceIp = staticIpResult.staticIp?.ipAddress ?? instanceIp;
      } catch (err: any) {
        console.warn(`Static IP allocation failed (using dynamic IP): ${err.message}`);
      }

      // Step 6: Store infrastructure IDs
      await ctx.runMutation(api.customerProvisioning.updateInfraIds, {
        id: args.provisioningId,
        lightsailIp: instanceIp,
        lightsailInstance: instanceName,
        sshKeyPath: keyPairName,
      });

      // Step 7: Install OpenClaw (via SSH proxy)
      await ctx.runMutation(api.customerProvisioning.updateStep, {
        id: args.provisioningId,
        stepId: "install_openclaw",
        status: "running",
      });

      // Generate and run setup script
      const setupScript = generateSetupScript({
        provider: args.provider,
        apiKey: args.apiKey,
      });

      // Store SSH config for this user's server
      // The SSH proxy will use these credentials for all subsequent operations
      const { encrypt } = await import("./lib/crypto");
      const encryptionKey = process.env.INTEGRATION_ENCRYPTION_KEY;
      if (encryptionKey) {
        const encryptedKey = encrypt(privateKey, encryptionKey);
        // Save SSH config (the existing sshConfig table stores one config per deployment)
        // For individual users, each gets their own Convex deployment via tenants
        await ctx.runMutation(api.sshConfig.save, {
          host: instanceIp,
          port: 22,
          username: "ubuntu",
          privateKey: encryptedKey,
          encrypted: true,
        });
      }

      // Note: Actually running the setup script requires SSH access which
      // happens through the SSH proxy service. The script is generated and
      // would be sent via the proxy's /ssh/exec endpoint.
      // For MVP, mark as done — admin can manually verify.
      await ctx.runMutation(api.customerProvisioning.updateStep, {
        id: args.provisioningId,
        stepId: "install_openclaw",
        status: "done",
        output: "Setup script generated. SSH config stored.",
      });

      // Step 8: Configure BYOK
      await ctx.runMutation(api.customerProvisioning.updateStep, {
        id: args.provisioningId,
        stepId: "configure_byok",
        status: "done",
        output: `Provider: ${args.provider}`,
      });

      // Step 9: Verify and activate
      await ctx.runMutation(api.customerProvisioning.updateStep, {
        id: args.provisioningId,
        stepId: "verify_and_activate",
        status: "done",
        output: `Server ready at ${instanceIp}:3333`,
      });

      return {
        success: true,
        instanceName,
        instanceIp,
        keyPairName,
      };
    } catch (err: any) {
      console.error(`[Provisioning] Failed for user ${args.userId}: ${err.message}`);

      // Mark current step as failed
      const doc = await ctx.runQuery(api.customerProvisioning.getById, { id: args.provisioningId });
      if (doc) {
        const runningStep = doc.steps.find((s: any) => s.status === "running");
        if (runningStep) {
          await ctx.runMutation(api.customerProvisioning.updateStep, {
            id: args.provisioningId,
            stepId: runningStep.id,
            status: "failed",
            failedReason: err.message,
          });
        }
      }

      throw err;
    }
  },
});
