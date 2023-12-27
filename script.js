// JavaScript for Text-to-Speech App

const form = document.getElementById("form");
const textArea = document.getElementById("text");
const languageSelect = document.getElementById("language");
const voiceSelect = document.getElementById("voice");
const speedInput = document.getElementById("speed");
const output = document.getElementById("output");
const downloadButton = document.getElementById("download");

let synth = window.speechSynthesis;
let voices = [];

// Get available voices
window.speechSynthesis.onvoiceschanged = () => {
  voices = synth.getVoices();
};

// Speak the text
const speak = () => {
  if (!synth.speaking) {
    // Check if text is empty
    if (textArea.value === "") {
      alert("Please enter some text to speak.");
      return;
    }

    // Get the selected language and voice
    const language = languageSelect.value;
    const voice = voices.find(voice => voice.lang === language);

    // Check if voice is available
    if (!voice) {
      alert("Voice not available.");
      return;
    }

    // Create the speech object
    const utterThis = new SpeechSynthesisUtterance(textArea.value);
    utterThis.voice = voice;
    utterThis.lang = language;
    utterThis.rate = speedInput.value;

    // Speak the text
    synth.speak(utterThis);

    // Update the output
    output.textContent = "Speaking...";
  }
};

// Stop speaking
const stop = () => {
  synth.cancel();
  output.textContent = "Stopped speaking.";
};

// Download the audio
const download = () => {
  // Check if text is empty
  if (textArea.value === "") {
    alert("Please enter some text to download.");
    return;
  }

  // Get the selected language and voice
  const language = languageSelect.value;
  const voice = voices.find(voice => voice.lang === language);

  // Check if voice is available
  if (!voice) {
    alert("Voice not available.");
    return;
  }

  // Create the speech object
  const utterThis = new SpeechSynthesisUtterance(textArea.value);
  utterThis.voice = voice;
  utterThis.lang = language;
  utterThis.rate = speedInput.value;

  // Get the audio data
  const audioContext = new AudioContext();
  const gainNode = audioContext.createGain();
  const oscillatorNode = audioContext.createOscillator();
  gainNode.connect(audioContext.destination);
  oscillatorNode.connect(gainNode);

  // Start the oscillator
  oscillatorNode.start();

  // Create the WAV file
  const wav = new WaveEncoder();
  const startTime = audioContext.currentTime;
  utterThis.onboundary = event => {
    if (event.name === "end") {
      const endTime = audioContext.currentTime;
      const audioBuffer = audioContext.createBuffer(1, endTime - startTime, 44100);
      const audioData = audioBuffer.getChannelData(0);
      for (let i = 0; i < audioData.length; i++) {
        audioData[i] = 0;
      }
      wav.encode([audioBuffer]);
      const audioBlob = new Blob([wav.finish()], { type: "audio/wav" });
      const url = URL.createObjectURL(audioBlob);

      // Download the WAV file
      const link = document.createElement("a");
      link.href = url;
      link.download = "speech.wav";
      link.click();

      // Stop the oscillator
      oscillatorNode.stop();

      // Disconnect the nodes
      gainNode.disconnect();
      oscillatorNode.disconnect();

      // Close the audio context
      audioContext.close();
    }
  };

  // Speak the text
  synth.speak(utterThis);
};

// Event listeners
form.addEventListener("submit", e => {
  e.preventDefault();
  speak();
});

form.addEventListener("reset", () => {
  stop();
  output.textContent = "";
});

downloadButton.addEventListener("click", download);