import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Server, Key, Zap, Check, Eye, EyeOff, ExternalLink, HelpCircle, AlertCircle } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SSH_PROXY_URL } from "@/lib/utils";

function Tooltip({ text }: { text: string }) {
  return (
    <div className="group relative inline-block ml-1">
      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
      <div className="invisible group-hover:visible absolute z-50 w-64 p-2 bg-popover border border-border rounded-lg shadow-lg text-xs text-popover-foreground bottom-full left-1/2 -translate-x-1/2 mb-2">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-border"></div>
      </div>
    </div>
  );
}

const SettingsPage = () => {
  const sshConfig = useQuery(api.sshConfig.get) ?? null;
  const saveSSH = useMutation(api.sshConfig.save);

  const [sshHost, setSshHost] = useState("");
  const [sshPort, setSshPort] = useState("22");
  const [sshUser, setSshUser] = useState("");
  const [sshKey, setSshKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (sshConfig) {
      setSshHost(sshConfig.host);
      setSshPort(sshConfig.port.toString());
      setSshUser(sshConfig.username);
    }
  }, [sshConfig]);

  const handleSave = async () => {
    try {
      await saveSSH({
        host: sshHost,
        port: parseInt(sshPort),
        username: sshUser,
        privateKey: sshKey,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error: any) {
      alert(`Error saving SSH config: ${error.message}`);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // If sshKey is empty, fetch from database
      let keyToUse = sshKey;
      if (!keyToUse) {
        const configResponse = await fetch("https://beloved-squirrel-599.convex.site/api/ssh/config-full");
        const fullConfig = await configResponse.json();
        if (fullConfig && fullConfig.privateKey) {
          keyToUse = fullConfig.privateKey;
        } else {
          setTestResult({ ok: false, message: "No SSH private key found. Please enter and save your SSH credentials first." });
          setTesting(false);
          return;
        }
      }

      // Use Convex's built-in SSH test endpoint
      const response = await fetch("https://beloved-squirrel-599.convex.site/api/ssh/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error: any) {
      setTestResult({ ok: false, message: `Cannot connect to SSH proxy service: ${error.message}` });
    }
    setTesting(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure server connection and automation
          </p>
        </div>

        {/* SSH Configuration */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">SSH Connection</h2>
            <Tooltip text="Configure SSH access to your OpenClaw server for automated restarts and SOUL file syncing." />
          </div>

          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-blue-500">
                  Enable One-Click Automation
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Once configured, you'll be able to restart OpenClaw and sync SOUL files directly from the UI without using the terminal.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Host */}
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-2 flex items-center uppercase tracking-wider">
                Server Address
                <Tooltip text="Your AWS Lightsail instance public IP or domain name" />
              </label>
              <input
                type="text"
                value={sshHost}
                onChange={(e) => setSshHost(e.target.value)}
                placeholder="12.34.56.78 or server.example.com"
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Port */}
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-2 flex items-center uppercase tracking-wider">
                SSH Port
                <Tooltip text="Usually 22 unless you've changed it" />
              </label>
              <input
                type="text"
                value={sshPort}
                onChange={(e) => setSshPort(e.target.value)}
                placeholder="22"
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Username */}
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-2 flex items-center uppercase tracking-wider">
                Username
                <Tooltip text="Usually 'ubuntu' for AWS Lightsail" />
              </label>
              <input
                type="text"
                value={sshUser}
                onChange={(e) => setSshUser(e.target.value)}
                placeholder="ubuntu"
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* SSH Key */}
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-2 flex items-center uppercase tracking-wider">
                SSH Private Key
                <Tooltip text="Your .pem or private key file content. This is stored securely and never sent to third parties." />
              </label>
              <div className="relative">
                <textarea
                  value={sshKey}
                  onChange={(e) => setSshKey(e.target.value)}
                  type={showKey ? "text" : "password"}
                  placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;MIIEpAIBAAKCAQEA...&#10;-----END RSA PRIVATE KEY-----"
                  className="w-full h-32 bg-secondary rounded-lg px-3 py-2 text-sm text-foreground font-mono border-0 outline-none focus:ring-1 focus:ring-primary resize-none"
                  style={{ filter: showKey ? "none" : "blur(4px)" }}
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute top-2 right-2 p-1.5 rounded hover:bg-surface-hover"
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Paste your entire private key file content here
              </p>
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`rounded-lg border p-3 ${
              testResult.ok
                ? "border-green-500/20 bg-green-500/5"
                : "border-red-500/20 bg-red-500/5"
            }`}>
              <div className="flex items-start gap-2">
                {testResult.ok ? (
                  <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`text-xs font-medium ${
                    testResult.ok ? "text-green-500" : "text-red-500"
                  }`}>
                    {testResult.ok ? "Connection Successful!" : "Connection Failed"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {testResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <button
              onClick={handleTestConnection}
              disabled={testing || !sshHost || !sshUser}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface-hover transition-colors disabled:opacity-50"
            >
              <Server className="w-4 h-4" />
              {testing ? "Testing..." : "Test Connection"}
            </button>
            <button
              onClick={handleSave}
              disabled={!sshHost || !sshUser || !sshKey}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Save Credentials
                </>
              )}
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Where to find your SSH details?
          </h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>
              <strong>AWS Lightsail:</strong> Go to your instance → Networking tab → Public IP is your server address
            </p>
            <p>
              <strong>SSH Key:</strong> Download from Lightsail → Account → SSH Keys, or use the key you created when launching the instance
            </p>
            <p>
              <strong>Username:</strong> Usually <code className="px-1 py-0.5 rounded bg-secondary">ubuntu</code> for Ubuntu instances
            </p>
          </div>
          <a
            href="https://lightsail.aws.amazon.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-primary hover:underline"
          >
            Open AWS Lightsail Console
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
