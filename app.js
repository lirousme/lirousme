const slides = [
  { title: 'Boas-vindas', content: 'Use o botão Play para iniciar. O modo automático apenas continua a revisão depois que o áudio terminar.' },
  { title: 'Relembre o conceito', content: 'Ouça a explicação e deixe a sequência avançar enquanto realiza outras tarefas.' },
  { title: 'Pronto para revisar', content: 'Pause a qualquer momento. Ao tocar novamente, a revisão continua deste slide.' }
];

const elements = {
  auto: document.querySelector('#auto-mode'), previous: document.querySelector('#previous-button'),
  next: document.querySelector('#next-button'), play: document.querySelector('#play-button'),
  playIcon: document.querySelector('#play-icon'), playLabel: document.querySelector('#play-label'),
  review: document.querySelector('#review-button'), title: document.querySelector('#slide-title'),
  content: document.querySelector('#slide-content'), progress: document.querySelector('#progress'),
  status: document.querySelector('#status'), help: document.querySelector('#auto-help')
};
let slideIndex = 0;
let isPlaying = false;
let playbackToken = 0;

function render() {
  const slide = slides[slideIndex];
  elements.title.textContent = slide.title;
  elements.content.textContent = slide.content;
  elements.progress.textContent = `Slide ${slideIndex + 1} de ${slides.length}`;
  elements.previous.disabled = slideIndex === 0;
  elements.next.disabled = slideIndex === slides.length - 1;
}
function updatePlayButton() {
  elements.playIcon.textContent = isPlaying ? '❚❚' : '▶';
  elements.playLabel.textContent = isPlaying ? 'Pause' : 'Play';
  elements.play.setAttribute('aria-label', isPlaying ? 'Pausar áudio' : 'Tocar áudio');
  elements.play.setAttribute('aria-pressed', String(isPlaying));
}
function speakCurrentSlide() {
  if (!('speechSynthesis' in window)) { elements.status.textContent = 'Áudio não é compatível neste navegador.'; isPlaying = false; updatePlayButton(); return; }
  const token = ++playbackToken;
  window.speechSynthesis.cancel();
  const slide = slides[slideIndex];
  const utterance = new SpeechSynthesisUtterance(`${slide.title}. ${slide.content}`);
  utterance.lang = 'pt-BR';
  utterance.onend = () => {
    if (!isPlaying || token !== playbackToken) return;
    if (elements.auto.checked && slideIndex < slides.length - 1) {
      slideIndex += 1; render(); elements.status.textContent = 'Próximo slide tocando automaticamente.';
      window.setTimeout(() => { if (isPlaying) speakCurrentSlide(); }, 80);
    } else { isPlaying = false; updatePlayButton(); elements.status.textContent = elements.auto.checked ? 'Revisão concluída.' : 'Áudio concluído. Use Next ou Review para avançar.'; }
  };
  window.speechSynthesis.speak(utterance);
  elements.status.textContent = `Tocando: ${slide.title}.`;
}
function startPlayback() {
  isPlaying = true; updatePlayButton();
  if (window.speechSynthesis?.paused) { window.speechSynthesis.resume(); elements.status.textContent = `Tocando: ${slides[slideIndex].title}.`; }
  else speakCurrentSlide();
}
function pausePlayback() {
  isPlaying = false; window.speechSynthesis?.pause(); updatePlayButton(); elements.status.textContent = 'Áudio pausado. Toque em Play para continuar.';
}
function goTo(index) { slideIndex = Math.max(0, Math.min(index, slides.length - 1)); render(); if (isPlaying) speakCurrentSlide(); else elements.status.textContent = 'Slide pronto. Toque em Play para ouvir.'; }
elements.play.addEventListener('click', () => isPlaying ? pausePlayback() : startPlayback());
elements.previous.addEventListener('click', () => goTo(slideIndex - 1));
elements.next.addEventListener('click', () => goTo(slideIndex + 1));
elements.review.addEventListener('click', () => goTo(slideIndex + 1));
elements.auto.addEventListener('change', () => { elements.help.textContent = elements.auto.checked ? 'Ao terminar o áudio, o próximo slide começa sozinho.' : 'Avance manualmente com Next ou Review.'; });
// Complements the viewport rule on mobile browsers that expose gesture events.
document.addEventListener('gesturestart', event => event.preventDefault(), { passive: false });
document.addEventListener('gesturechange', event => event.preventDefault(), { passive: false });
document.addEventListener('gestureend', event => event.preventDefault(), { passive: false });
render(); updatePlayButton();
