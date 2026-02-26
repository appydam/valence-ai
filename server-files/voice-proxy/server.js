const http = require("http");
const WebSocket = require("ws");
const {
  BedrockRuntimeClient,
  InvokeModelWithBidirectionalStreamCommand,
} = require("@aws-sdk/client-bedrock-runtime");
const { NodeHttp2Handler } = require("@smithy/node-http-handler");
const { randomUUID } = require("crypto");

// ── Config ───────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || "3002", 10);
const VOICE_PROXY_SECRET = process.env.VOICE_PROXY_SECRET || "";
const MODEL_ID = "amazon.nova-2-sonic-v1:0";

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_BEDROCK_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  requestHandler: new NodeHttp2Handler({
    requestTimeout: 300000,
    sessionTimeout: 300000,
    disableConcurrentStreams: false,
    maxConcurrentStreams: 20,
  }),
});

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// ── AsyncEventQueue ─────────────────────────────────────────
// Queue-based AsyncIterable for continuous bidirectional streaming.
// Each enqueued event is JSON-stringified and wrapped in { chunk: { bytes } }.

class AsyncEventQueue {
  constructor() {
    this._queue = [];
    this._resolve = null;
    this._done = false;
  }

  push(event) {
    const bytes = encoder.encode(JSON.stringify(event));
    const item = { chunk: { bytes } };
    if (this._resolve) {
      const resolve = this._resolve;
      this._resolve = null;
      resolve({ value: item, done: false });
    } else {
      this._queue.push(item);
    }
  }

  close() {
    this._done = true;
    if (this._resolve) {
      const resolve = this._resolve;
      this._resolve = null;
      resolve({ value: undefined, done: true });
    }
  }

  [Symbol.asyncIterator]() {
    return this;
  }

  next() {
    if (this._queue.length > 0) {
      return Promise.resolve({ value: this._queue.shift(), done: false });
    }
    if (this._done) {
      return Promise.resolve({ value: undefined, done: true });
    }
    return new Promise((resolve) => {
      this._resolve = resolve;
    });
  }
}

// ── HTTP Server (health check) ───────────────────────────────

const httpServer = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, uptime: process.uptime() }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

// ── WebSocket Server ─────────────────────────────────────────

const wss = new WebSocket.Server({ server: httpServer, path: "/ws/voice" });

wss.on("connection", (ws, req) => {
  // Auth check
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const token = url.searchParams.get("token");
  if (VOICE_PROXY_SECRET && token !== VOICE_PROXY_SECRET) {
    ws.close(4001, "Unauthorized");
    return;
  }

  console.log("[Voice] New WebSocket connection");

  let sessionActive = false;
  const sessionId = randomUUID();
  let promptName = randomUUID();
  let contentName = randomUUID();
  let eventQueue = null;

  // 8-minute session timeout
  const sessionTimeout = setTimeout(() => {
    console.log("[Voice] Session timeout (8 min)");
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "session.ended", reason: "timeout" }));
    }
    cleanup();
  }, 8 * 60 * 1000);

  async function startBedrockSession(config) {
    try {
      promptName = randomUUID();
      contentName = randomUUID();

      eventQueue = new AsyncEventQueue();

      // 1. sessionStart — patient turn-taking + short responses
      eventQueue.push({
        event: {
          sessionStart: {
            inferenceConfiguration: {
              maxTokens: 256,
              topP: 0.85,
              temperature: 0.4,
            },
            turnDetectionConfiguration: {
              endpointingSensitivity: "LOW",
            },
          },
        },
      });

      // 2. promptStart with audio config
      const promptStartEvent = {
        event: {
          promptStart: {
            promptName,
            textOutputConfiguration: {
              mediaType: "text/plain",
            },
            audioOutputConfiguration: {
              mediaType: "audio/lpcm",
              sampleRateHertz: config.sampleRate || 16000,
              sampleSizeBits: 16,
              channelCount: 1,
              voiceId: config.voiceId || "tiffany",
              encoding: "base64",
              audioType: "SPEECH",
            },
          },
        },
      };

      // Add tool config if provided
      if (config.toolConfig && config.toolConfig.tools) {
        promptStartEvent.event.promptStart.toolUseOutputConfiguration = {
          mediaType: "application/json",
        };
        promptStartEvent.event.promptStart.toolConfiguration = {
          tools: config.toolConfig.tools.map((t) => ({
            toolSpec: {
              name: t.name,
              description: t.description,
              inputSchema: { json: t.inputSchema },
            },
          })),
          toolChoice: { auto: {} },
        };
      }

      eventQueue.push(promptStartEvent);

      // 3. System prompt
      if (config.systemPrompt) {
        const systemContentName = randomUUID();
        eventQueue.push({
          event: {
            contentStart: {
              promptName,
              contentName: systemContentName,
              type: "TEXT",
              role: "SYSTEM",
              interactive: false,
              textInputConfiguration: {
                mediaType: "text/plain",
              },
            },
          },
        });
        eventQueue.push({
          event: {
            textInput: {
              promptName,
              contentName: systemContentName,
              content: config.systemPrompt,
            },
          },
        });
        eventQueue.push({
          event: {
            contentEnd: {
              promptName,
              contentName: systemContentName,
            },
          },
        });
      }

      // 4. Start user audio content (interactive = true for continuous streaming)
      contentName = randomUUID();
      eventQueue.push({
        event: {
          contentStart: {
            promptName,
            contentName,
            type: "AUDIO",
            role: "USER",
            interactive: true,
            audioInputConfiguration: {
              mediaType: "audio/lpcm",
              sampleRateHertz: config.sampleRate || 16000,
              sampleSizeBits: 16,
              channelCount: 1,
              audioType: "SPEECH",
              encoding: "base64",
            },
          },
        },
      });

      console.log("[Voice] Sending InvokeModelWithBidirectionalStreamCommand...");

      const command = new InvokeModelWithBidirectionalStreamCommand({
        modelId: MODEL_ID,
        body: eventQueue,
      });

      const response = await bedrockClient.send(command);
      console.log("[Voice] Bedrock stream established");

      // Process output events from response stream
      if (response.body) {
        for await (const chunk of response.body) {
          if (!sessionActive) break;

          // Response events come as { chunk: { bytes: Uint8Array } }
          // Parse the JSON from bytes
          let event;
          try {
            if (chunk.chunk && chunk.chunk.bytes) {
              const text = decoder.decode(chunk.chunk.bytes);
              event = JSON.parse(text);
            } else {
              // Some events may come unwrapped
              event = chunk;
            }
          } catch (parseErr) {
            console.error("[Voice] Failed to parse response event:", parseErr.message);
            continue;
          }

          // Handle different event types from Nova Sonic
          const e = event.event || event;

          if (e.audioOutput) {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "audio.response",
                  data: e.audioOutput.content,
                })
              );
            }
          } else if (e.textOutput) {
            const role = e.textOutput.role || "ASSISTANT";
            if (ws.readyState === WebSocket.OPEN) {
              if (role === "USER") {
                ws.send(
                  JSON.stringify({
                    type: "transcript.user",
                    text: e.textOutput.content,
                    isFinal: true,
                  })
                );
              } else {
                ws.send(
                  JSON.stringify({
                    type: "transcript.agent",
                    text: e.textOutput.content,
                    isFinal: true,
                  })
                );
              }
            }
          } else if (e.toolUse) {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "tool.use",
                  toolUseId: e.toolUse.toolUseId,
                  name: e.toolUse.toolName,
                  input: JSON.parse(e.toolUse.content || "{}"),
                })
              );
            }
          } else if (e.completionEnd || e.sessionEnd) {
            console.log("[Voice] Stream ended naturally");
          }
        }
      }
    } catch (err) {
      console.error("[Voice] Bedrock stream error:", err.message);
      console.error("[Voice] Full error:", err);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "error", message: err.message }));
      }
    }
  }

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case "session.start":
          sessionActive = true;
          ws.send(JSON.stringify({ type: "session.ready", sessionId }));
          startBedrockSession(msg.config);
          break;

        case "audio.chunk":
          if (sessionActive && eventQueue) {
            eventQueue.push({
              event: {
                audioInput: {
                  promptName,
                  contentName,
                  content: msg.data,
                },
              },
            });
          }
          break;

        case "text.input":
          if (sessionActive && eventQueue) {
            const textContentName = randomUUID();
            eventQueue.push({
              event: {
                contentStart: {
                  promptName,
                  contentName: textContentName,
                  type: "TEXT",
                  role: "USER",
                  interactive: true,
                  textInputConfiguration: { mediaType: "text/plain" },
                },
              },
            });
            eventQueue.push({
              event: {
                textInput: {
                  promptName,
                  contentName: textContentName,
                  content: msg.content,
                },
              },
            });
            eventQueue.push({
              event: { contentEnd: { promptName, contentName: textContentName } },
            });
          }
          break;

        case "tool.result":
          if (sessionActive && eventQueue) {
            const toolContentName = randomUUID();
            eventQueue.push({
              event: {
                contentStart: {
                  promptName,
                  contentName: toolContentName,
                  interactive: false,
                  type: "TOOL",
                  role: "TOOL",
                  toolResultInputConfiguration: {
                    toolUseId: msg.toolUseId,
                    type: "TEXT",
                    textInputConfiguration: { mediaType: "text/plain" },
                  },
                },
              },
            });
            eventQueue.push({
              event: {
                toolResult: {
                  promptName,
                  contentName: toolContentName,
                  content: typeof msg.result === "string" ? msg.result : JSON.stringify(msg.result),
                },
              },
            });
            eventQueue.push({
              event: { contentEnd: { promptName, contentName: toolContentName } },
            });
          }
          break;

        case "session.end":
          endSession();
          break;
      }
    } catch (err) {
      console.error("[Voice] Message parse error:", err.message);
    }
  });

  ws.on("close", () => {
    console.log("[Voice] WebSocket closed");
    cleanup();
  });

  ws.on("error", (err) => {
    console.error("[Voice] WebSocket error:", err.message);
    cleanup();
  });

  function endSession() {
    if (eventQueue && sessionActive) {
      // Send end events through the stream
      eventQueue.push({ event: { contentEnd: { promptName, contentName } } });
      eventQueue.push({ event: { promptEnd: { promptName } } });
      eventQueue.push({ event: { sessionEnd: {} } });
      // Close the queue after a brief delay to allow events to flush
      setTimeout(() => {
        if (eventQueue) eventQueue.close();
        cleanup();
      }, 500);
    } else {
      cleanup();
    }
  }

  function cleanup() {
    sessionActive = false;
    clearTimeout(sessionTimeout);
    if (eventQueue) {
      eventQueue.close();
      eventQueue = null;
    }
  }
});

// ── Start ────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`[Voice Proxy] Listening on port ${PORT}`);
  console.log(`[Voice Proxy] WebSocket endpoint: ws://localhost:${PORT}/ws/voice`);
  console.log(`[Voice Proxy] Health check: http://localhost:${PORT}/health`);
});
