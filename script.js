let perguntas = [];
let perguntasSorteadas = [];
let perguntaAtualIndex = 0;
let tempoRestante = 15;
let timerInterval = null;

// Seletores das telas
const screenIntro = document.getElementById('screen-intro');
const screenGame = document.getElementById('screen-game');
const screenResult = document.getElementById('screen-result');

// Seletores do jogo
const timerElement = document.getElementById('timer');
const questionText = document.getElementById('question-text');
const btn0 = document.getElementById('btn-0');
const btn1 = document.getElementById('btn-1');
const btn2 = document.getElementById('btn-2');
const btn3 = document.getElementById('btn-3');
const resultMessage = document.getElementById('result-message');

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

// Algoritmo para embaralhar uma lista (Fisher-Yates)
function embaralhar(array) {
  const lista = [...array];
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
}

// Iniciar o jogo
function iniciarJogo() {
  if (perguntas.length === 0) return;
  
  perguntasSorteadas = embaralhar(perguntas);
  perguntaAtualIndex = 0;
  
  exibirPergunta();
  
  screenIntro.classList.remove('active');
  screenResult.classList.remove('active');
  screenGame.classList.add('active');
}

// Exibir a pergunta atual e iniciar o timer
function exibirPergunta() {
  const q = perguntasSorteadas[perguntaAtualIndex];
  questionText.innerText = q.pergunta;
  btn0.innerText = `1. ${q.opcoes[0]}`;
  btn1.innerText = `2. ${q.opcoes[1]}`;
  btn2.innerText = `3. ${q.opcoes[2]}`;
  btn3.innerText = `4. ${q.opcoes[3]}`;

  iniciarTimer();
}

// Controle da contagem regressiva
function iniciarTimer() {
  clearInterval(timerInterval);
  tempoRestante = 15;
  timerElement.innerText = tempoRestante;

  timerInterval = setInterval(() => {
    tempoRestante--;
    timerElement.innerText = tempoRestante;

    if (tempoRestante <= 0) {
      clearInterval(timerInterval);
      tempoEsgotado();
    }
  }, 1000);
}

// Tratamento quando o tempo acaba
function tempoEsgotado() {
  screenGame.classList.remove('active');
  screenResult.classList.add('active');
  resultMessage.innerText = "TEMPO ESGOTADO! ⏱️";
  resultMessage.style.color = "#f1c40f";

  agendarProximaPergunta();
}

// Conferir resposta do jogador
function verificarResposta(opcaoSelecionada) {
  clearInterval(timerInterval);

  const q = perguntasSorteadas[perguntaAtualIndex];
  
  screenGame.classList.remove('active');
  screenResult.classList.add('active');

  if (opcaoSelecionada === q.correta) {
    resultMessage.innerText = "RESPOSTA CORRETA! 🎉";
    resultMessage.style.color = "#2ecc71";
  } else {
    resultMessage.innerText = "RESPOSTA INCORRETA! ❌";
    resultMessage.style.color = "#e74c3c";
  }

  agendarProximaPergunta();
}

// Transição para a próxima pergunta ou encerramento
function agendarProximaPergunta() {
  setTimeout(() => {
    perguntaAtualIndex++;

    if (perguntaAtualIndex < perguntasSorteadas.length) {
      exibirPergunta();
      screenResult.classList.remove('active');
      screenGame.classList.add('active');
    } else {
      screenResult.classList.remove('active');
      screenIntro.classList.add('active');
    }
  }, 2500);
}

// Escutar teclas do teclado (simulando botões físicos ou Raspberry)
document.addEventListener('keydown', (event) => {
  if (screenIntro.classList.contains('active')) {
    iniciarJogo();
    return;
  }

  if (screenGame.classList.contains('active')) {
    if (['1', '2', '3', '4'].includes(event.key)) {
      const opcao = parseInt(event.key) - 1;
      verificarResposta(opcao);
    }
  }
});

// Permitir toque nos botões para testes no celular
btn0.addEventListener('click', () => verificarResposta(0));
btn1.addEventListener('click', () => verificarResposta(1));
btn2.addEventListener('click', () => verificarResposta(2));
btn3.addEventListener('click', () => verificarResposta(3));
screenIntro.addEventListener('click', () => iniciarJogo());

// Inicializar banco de perguntas
carregarPerguntas();
