export function speakText(text: string, lang: string = "en") {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    alert("Sorry, your browser does not support text-to-speech.");
    return;
  }
  const utterance = new window.SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1;
  utterance.volume = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
