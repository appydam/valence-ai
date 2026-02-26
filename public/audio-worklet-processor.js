class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096; // ~256ms at 16kHz
    this.buffer = new Float32Array(this.bufferSize);
    this.writeIndex = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channel = input[0]; // Mono
    for (let i = 0; i < channel.length; i++) {
      this.buffer[this.writeIndex++] = channel[i];
      if (this.writeIndex >= this.bufferSize) {
        // Send accumulated buffer to main thread
        this.port.postMessage(this.buffer.slice(0));
        this.writeIndex = 0;
      }
    }
    return true;
  }
}

registerProcessor("pcm-processor", PCMProcessor);
