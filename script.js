let perguntas = [];
let perguntasSorteadas = [];
let perguntaAtualIndex = 0;
let tempoRestante = 20;
let timerInterval = null;
let photoInterval = null;
let jogoAtivo = false;

// Banco de Imagens (Arquivos dentro da pasta assets/img/)
const galeriaFotos = [
  'assets/img/foto1.jpg',
  'assets/img/foto2.jpg',
  'assets/img/foto3.jpg',
  'assets/img/foto4.jpg'
];

// Banco de Áudios (Arquivos dentro da pasta assets/audio/)
const sonsAcerto = [
  'assets/audio/acerto1.mp3'
];

const sonsErro = [
  'assets/audio/erro1.mp3'
];

// Seletores das telas e elementos da interface
const screenIntro = document.getElementById('screen-intro');
const screenGame = document.getElementById('screen-game');
const screenResult = document.getElementById('screen-result');

const imgTop = document.getElementById('img-top');
const imgBottom = document.getElementById('img-bottom');

const timerElement = document.getElementById('timer');
const questionText = document.getElementById('question-text');
const btn0 = document.getElementById('btn-0');
const btn1 = document.getElementById('btn-1');
const btn2 = document.getElementById('btn-2');
const btn3 = document.getElementById('btn-3');
const resultMessage = document.getElementById('result-message');

const optionButtons = [btn0, btn1, btn2, btn3];

// Carregar perguntas do arquivo JSON
async function carregarPerguntas() {
  try {
    const resposta = await fetch('perguntas.json');
    perguntas = await resposta.json();
    console.log('Perguntas carregadas com sucesso!');
  } catch (erro) {
    console.error('Erro ao carregar perguntas:', erro);
  }
}

// Reproduzir efeito sonoro sem interromper a execução caso o arquivo não exista
function tocarSom(tipo) {
  let lista = tipo === 'acerto' ? sonsAcerto : sonsErro;
  if (lista.length === 0) return;
  const somSorteado = lista[Math.floor(Math.random() * lista.length)];
  const audio = new Audio(somSorteado);
  audio.play().catch(e => console.log("Áudio indisponível ou aguardando interação do usuário"));
}

// Definir a imagem com segurança (esconde a tag caso a foto falhe no carregamento)
function definirImagem(elementoImg, src) {
  if (!src) {
    elementoImg.style.display = 'none';
    return;
  }
  const imgTemp = new Image();
  imgTemp.src = src;
  imgTemp.onload = () => {
    elementoImg.src = src;
    elementoImg.style.display = 'block';
  };
  imgTemp.onerror = () => {
    elementoImg.style.display = 'none';
  };
}

// Rotacionar fotos na tela de descanso sem repetir a mesma foto no topo e base
function alternarFotosApresentacao() {
  if (galeriaFotos.length === 0) return;

  if (galeriaFotos.length === 1) {
    definirImagem(imgTop, galeriaFotos[0]);
    imgBottom.style.display = 'none';
    return;
  }

  let idx1 = Math.floor(Math.random() * galeriaFotos.length);
  let idx2;
  do {
    idx2 = Math.floor(Math.random() * galeriaFotos.length);
  } while (idx1 === idx2);

  definirImagem(imgTop, galeriaFotos[idx1]);
  definirImagem(imgBottom, galeriaFotos[idx2]);
}

function iniciarCarrosselFotos() {
  alternarFotosApresentacao();
  photoInterval = setInterval(alternarFotosApresentacao, 5000);
}

function pararCarrosselFotos() {
  clearInterval(photoInterval);
}

// Embaralhar elementos do array (Fisher-Yates)
function embaralhar(array) {
  const lista = [...array];
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
}

function limparClassesBotoes() {
  optionButtons.forEach(btn => btn.classList.remove('correta', 'incorreta'));
}

// Iniciar rodada do jogo
function iniciarJogo() {
  if (perguntas.length === 0) return;
  
  pararCarrosselFotos();
  perguntasSorteadas = embaralhar(perguntas);
  perguntaAtualIndex = 0;
  jogoAtivo = true;
  
  exibirPergunta();
  
  screenIntro.classList.remove('active');
  screenResult.classList.remove('active');
  screenGame.classList.add('active');
}

function exibirPergunta() {
  limparClassesBotoes();

  const q = perguntasSorteadas[perguntaAtualIndex];
  questionText.innerText = q.pergunta;
  btn0.innerText = `1. ${q.opcoes[0]}`;
  btn1.innerText = `2. ${q.opcoes[1]}`;
  btn2.innerText = `3. ${q.opcoes[2]}`;
  btn3.innerText = `4. ${q.opcoes[3]}`;

  iniciarTimer();
}

// Atualizar cores do contador numérico
function atualizarEstiloTimer(tempo) {
  timerElement.className = '';

  if (tempo >= 15) {
    timerElement.classList.add('timer-verde');
  } else if (tempo >= 10) {
    timerElement.classList.add('timer-amarelo');
  } else if (tempo >= 6) {
    timerElement.classList.add('timer-laranja');
  } else if (tempo >= 4) {
    timerElement.classList.add('timer-vermelho');
  } else {
    timerElement.classList.add('timer-piscar');
  }
}

// Controle da contagem regressiva de 20s
function iniciarTimer() {
  clearInterval(timerInterval);
  tempoRestante = 20;
  timerElement.innerText = tempoRestante;
  atualizarEstiloTimer(tempoRestante);

  timerInterval = setInterval(() => {
    tempoRestante--;
    timerElement.innerText = tempoRestante;
    atualizarEstiloTimer(tempoRestante);

    if (tempoRestante <= 0) {
      clearInterval(timerInterval);
      tempoEsgotado();
    }
  }, 1000);
}

// Tratamento de tempo esgotado (aguarda 5s e retorna à tela inicial)
function tempoEsgotado() {
  jogoAtivo = false;
  tocarSom('erro');
  
  screenGame.classList.remove('active');
  screenResult.classList.add('active');
  resultMessage.innerText = "TEMPO ESGOTADO! ⏱️";
  resultMessage.style.color = "#f1c40f";

  setTimeout(() => {
    screenResult.classList.remove('active');
    screenIntro.classList.add('active');
    iniciarCarrosselFotos();
  }, 5000);
}

// Avaliação da resposta fornecida pelo usuário
function verificarResposta(opcaoSelecionada) {
  if (!jogoAtivo) return;
  clearInterval(timerInterval);

  const q = perguntasSorteadas[perguntaAtualIndex];
  const indiceCorreto = q.correta;

  if (opcaoSelecionada === indiceCorreto) {
    optionButtons[opcaoSelecionada].classList.add('correta');
    tocarSom('acerto');
  } else {
    optionButtons[opcaoSelecionada].classList.add('incorreta');
    optionButtons[indiceCorreto].classList.add('correta');
    tocarSom('erro');
  }

  setTimeout(() => {
    screenGame.classList.remove('active');
    screenResult.classList.add('active');

    if (opcaoSelecionada === indiceCorreto) {
      resultMessage.innerText = "RESPOSTA CORRETA! 🎉";
      resultMessage.style.color = "#2ecc71";
    } else {
      resultMessage.innerText = "RESPOSTA INCORRETA! ❌";
      resultMessage.style.color = "#e74c3c";
    }

    agendarProximaPergunta();
  }, 2000);
}

function agendarProximaPergunta() {
  setTimeout(() => {
    perguntaAtualIndex++;

    if (perguntaAtualIndex < perguntasSorteadas.length) {
      exibirPergunta();
      screenResult.classList.remove('active');
      screenGame.classList.add('active');
    } else {
      jogoAtivo = false;
      screenResult.classList.remove('active');
      screenIntro.classList.add('active');
      iniciarCarrosselFotos();
    }
  }, 2500);
}

// Atendimento de teclas numéricas (1, 2, 3, 4)
document.addEventListener('keydown', (event) => {
  if (screenIntro.classList.contains('active')) {
    iniciarJogo();
    return;
  }

  if (screenGame.classList.contains('active') && jogoAtivo) {
    if (['1', '2', '3', '4'].includes(event.key)) {
      verificarResposta(parseInt(event.key) - 1);
    }
  }
});

// Eventos diretos de clique para acionamento por toque ou mouse
btn0.addEventListener('click', () => verificarResposta(0));
btn1.addEventListener('click', () => verificarResposta(1));
btn2.addEventListener('click', () => verificarResposta(2));
btn3.addEventListener('click', () => verificarResposta(3));
screenIntro.addEventListener('click', () => iniciarJogo());

// Inicialização do aplicativo
carregarPerguntas();
iniciarCarrosselFotos();
