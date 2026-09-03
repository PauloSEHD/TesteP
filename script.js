let perguntas = [];
let perguntaAtualIndex = 0;

// Seletores das telas
const screenIntro = document.getElementById('screen-intro');
const screenGame = document.getElementById('screen-game');
const screenResult = document.getElementById('screen-result');

// Seletores do jogo
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

// Iniciar o jogo
function iniciarJogo() {
  if (perguntas.length === 0) return;
  perguntaAtualIndex = 0;
  exibirPergunta(perguntaAtualIndex);
  
  screenIntro.classList.remove('active');
  screenResult.classList.remove('active');
  screenGame.classList.add('active');
}

// Exibir pergunta atual na tela
function exibirPergunta(index) {
  const q = perguntas[index];
  questionText.innerText = q.pergunta;
  btn0.innerText = `1. ${q.opcoes[0]}`;
  btn1.innerText = `2. ${q.opcoes[1]}`;
  btn2.innerText = `3. ${q.opcoes[2]}`;
  btn3.innerText = `4. ${q.opcoes[3]}`;
}

// Conferir resposta do jogador
function verificarResposta(opcaoSelecionada) {
  const q = perguntas[perguntaAtualIndex];
  
  screenGame.classList.remove('active');
  screenResult.classList.add('active');

  if (opcaoSelecionada === q.correta) {
    resultMessage.innerText = "RESPOSTA CORRETA! 🎉";
    resultMessage.style.color = "#2ecc71";
  } else {
    resultMessage.innerText = "RESPOSTA INCORRETA! ❌";
    resultMessage.style.color = "#e74c3c";
  }

  // Voltar para a tela inicial após 3 segundos
  setTimeout(() => {
    screenResult.classList.remove('active');
    screenIntro.classList.add('active');
  }, 3000);
}

// Escutar teclas do teclado (ou botões da Raspberry Pi Pico)
document.addEventListener('keydown', (event) => {
  // Se estiver na tela inicial, qualquer tecla inicia o jogo
  if (screenIntro.classList.contains('active')) {
    iniciarJogo();
    return;
  }

  // Se estiver na tela de jogo, teclas 1, 2, 3 ou 4 respondem
  if (screenGame.classList.contains('active')) {
    if (['1', '2', '3', '4'].includes(event.key)) {
      const opcao = parseInt(event.key) - 1;
      verificarResposta(opcao);
    }
  }
});

// Permitir clique nos botões para testes pelo celular
btn0.addEventListener('click', () => verificarResposta(0));
btn1.addEventListener('click', () => verificarResposta(1));
btn2.addEventListener('click', () => verificarResposta(2));
btn3.addEventListener('click', () => verificarResposta(3));
screenIntro.addEventListener('click', () => iniciarJogo());

// Inicializa o carregamento do JSON
carregarPerguntas();
