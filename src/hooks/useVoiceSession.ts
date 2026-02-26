import { useState, useRef, useCallback } from "react";

const VOICE_PROXY_URL = import.meta.env.VITE_VOICE_PROXY_URL as string;
const VOICE_PROXY_SECRET = import.meta.env.VITE_VOICE_PROXY_SECRET as string;

export type VoiceState = "idle" | "connecting" | "active" | "error";

export interface VoiceTranscriptEntry {
  speaker: string;
  text: string;
}

export interface VoiceSessionConfig {
  systemPrompt: string;
  voiceId?: string;
  sampleRate?: number;
  speakerLabel?: string;
  tools?: Array<{
    name: string;
    description: string;
    inputSchema: Record<string, any>;
  }>;
  onToolCall?: (toolUseId: string, name: string, input: any, ws: WebSocket) => void;
}

function float32ToPcm16Base64(float32: Float32Array): string {
  const buffer = new ArrayBuffer(float32.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

// ── Queued Audio Player ─────────────────────────────────────
// Queues incoming PCM chunks and plays them sequentially
// to prevent choppy overlapping playback.

class AudioChunkPlayer {
  private audioContext: AudioContext;
  private queue: Float32Array[] = [];
  private isPlaying = false;
  private nextStartTime = 0;
  private gainNode: GainNode;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.gainNode = audioContext.createGain();
    this.gainNode.gain.value = 1.0;
    this.gainNode.connect(audioContext.destination);
  }

  enqueue(base64: string) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;
    this.queue.push(float32);
    this.flush();
  }

  private flush() {
    if (this.isPlaying && this.queue.length === 0) return;

    const now = this.audioContext.currentTime;
    if (this.nextStartTime < now) {
      this.nextStartTime = now;
    }

    while (this.queue.length > 0) {
      const samples = this.queue.shift()!;
      const buf = this.audioContext.createBuffer(1, samples.length, this.audioContext.sampleRate);
      buf.copyToChannel(samples, 0);
      const source = this.audioContext.createBufferSource();
      source.buffer = buf;
      source.connect(this.gainNode);
      source.start(this.nextStartTime);
      this.nextStartTime += buf.duration;
      this.isPlaying = true;
    }
  }

  stop() {
    this.queue = [];
    this.isPlaying = false;
    this.nextStartTime = 0;
  }
}

export function useVoiceSession() {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [agentTranscript, setAgentTranscript] = useState("");
  const [transcriptHistory, setTranscriptHistory] = useState<VoiceTranscriptEntry[]>([]);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const playerRef = useRef<AudioChunkPlayer | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopVoice = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "session.end" }));
    }
    wsRef.current?.close();
    wsRef.current = null;
    workletNodeRef.current?.disconnect();
    workletNodeRef.current = null;
    playerRef.current?.stop();
    playerRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
    speakingTimeoutRef.current = null;
    setVoiceState("idle");
    setIsListening(false);
    setIsSpeaking(false);
    setIsVoiceMode(false);
    setElapsedSeconds(0);
  }, []);

  const startVoice = useCallback(async (config: VoiceSessionConfig) => {
    if (!VOICE_PROXY_URL) {
      setVoiceState("error");
      return;
    }

    setVoiceState("connecting");
    setIsVoiceMode(true);
    setTranscriptHistory([]);
    setUserTranscript("");
    setAgentTranscript("");
    setElapsedSeconds(0);

    const speakerLabel = config.speakerLabel || "Kaze";

    // Start elapsed timer
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: config.sampleRate || 16000 },
      });
      streamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: config.sampleRate || 16000 });
      audioContextRef.current = audioContext;

      const player = new AudioChunkPlayer(audioContext);
      playerRef.current = player;

      await audioContext.audioWorklet.addModule("/audio-worklet-processor.js");
      const workletNode = new AudioWorkletNode(audioContext, "pcm-processor");
      workletNodeRef.current = workletNode;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(workletNode);

      const token = VOICE_PROXY_SECRET || "";
      const ws = new WebSocket(`${VOICE_PROXY_URL}?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setVoiceState("active");
        setIsListening(true);
        ws.send(JSON.stringify({
          type: "session.start",
          config: {
            systemPrompt: config.systemPrompt,
            voiceId: config.voiceId || "matthew",
            sampleRate: config.sampleRate || 16000,
            ...(config.tools ? { toolConfig: { tools: config.tools } } : {}),
          },
        }));
      };

      // Forward PCM from AudioWorklet to WebSocket
      workletNode.port.onmessage = (event) => {
        if (ws.readyState === WebSocket.OPEN) {
          const pcmBase64 = float32ToPcm16Base64(event.data);
          ws.send(JSON.stringify({ type: "audio.chunk", data: pcmBase64 }));
        }
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case "audio.response":
            // Queue for smooth sequential playback
            player.enqueue(msg.data);
            setIsSpeaking(true);
            // Auto-clear speaking state after silence (no new chunks for 800ms)
            if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
            speakingTimeoutRef.current = setTimeout(() => setIsSpeaking(false), 800);
            break;
          case "transcript.user":
            setUserTranscript(msg.text);
            if (msg.isFinal) {
              setTranscriptHistory((prev) => [...prev, { speaker: "user", text: msg.text }]);
              setUserTranscript("");
            }
            break;
          case "transcript.agent":
            setAgentTranscript(msg.text);
            setIsSpeaking(true);
            if (msg.isFinal) {
              setTranscriptHistory((prev) => [...prev, { speaker: speakerLabel, text: msg.text }]);
              setAgentTranscript("");
            }
            break;
          case "tool.use":
            if (config.onToolCall) {
              config.onToolCall(msg.toolUseId, msg.name, msg.input, ws);
            }
            break;
          case "session.ended":
            stopVoice();
            break;
          case "error":
            setVoiceState("error");
            break;
        }
      };

      ws.onclose = () => stopVoice();
      ws.onerror = () => {
        setVoiceState("error");
        stopVoice();
      };
    } catch {
      setVoiceState("error");
    }
  }, [stopVoice]);

  return {
    voiceState,
    isSpeaking,
    isListening,
    isVoiceMode,
    userTranscript,
    agentTranscript,
    transcriptHistory,
    elapsedSeconds,
    startVoice,
    stopVoice,
    isAvailable: !!VOICE_PROXY_URL,
    wsRef,
  };
}
