// components/landing/CodeSnippet.tsx
const CodeSnippet = () => {
    return (
      <div className="bg-slate-800 border-slate-800 p-4 rounded-lg text-white">
        <pre>
          <code>
            {`import numpy as np
from scipy.io.wavfile import write

# Generate a musical chord (C major)
sample_rate = 44100
duration = 3  # seconds
t = np.linspace(0, duration, int(sample_rate * duration))

# C4, E4, G4 frequencies
c_note = np.sin(2 * np.pi * 261.63 * t)
e_note = np.sin(2 * np.pi * 329.63 * t)
g_note = np.sin(2 * np.pi * 392.00 * t)

# Combine to create chord
chord = (c_note + e_note + g_note) * 0.3

# Save as WAV file
write("c_major_chord.wav", sample_rate, chord.astype(np.float32))`}
          </code>
        </pre>
      </div>
    );
  };
  
  export default CodeSnippet;
  