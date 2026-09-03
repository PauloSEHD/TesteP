let perguntas = [];
let perguntasSorteadas = [];
let perguntaAtualIndex = 0;
let tempoRestante = 15;
let timerInterval = null;
let jogoAtivo = false; // Nova flag para controlar se o jogo está rolando

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

// Atalho para pegar todos os botões de opção
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

// Algoritmo para embaralhar uma lista (Fisher-Yates)
function embaralhar(array) {
  const lista = [...array];
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
}

// Limpar as classes de feedback dos botões
function limparClassesBotoes() {
  optionButtons.forEach(btn => {
    btn.classList.remove('correta', 'incorreta');
  });
}

// Iniciar o jogo
function iniciarJogo() {
  if (perguntas.length === 0) return;
  
  perguntasSorteadas = embaralhar(perguntas);
  perguntaAtualIndex = 0;
  jogoAtivo = true;
  
  exibirPergunta();
  
  screenIntro.classList.remove('active');
  screenResult.classList.remove('active');
  screenGame.classList.add('active');
}

// Exibir a pergunta atual e iniciar o timer
function exibirPergunta() {
  limparClassesBotoes(); // Garante que os botões comecem limpos

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
  timerElement.style.color = "white"; // Reseta cor do timer

  timerInterval = setInterval(() => {
    tempoRestante--;
    timerElement.innerText = tempoRestante;

    // Alerta visual quando o tempo está acabando (menos de 5s)
    if (tempoRestante <= 5) {
        timerElement.style.color = "#e74c3c";
    }

    if (tempoRestante <= 0) {
      clearInterval(timerInterval);
      tempoEsgotado();
    }
  }, 1000);
}

// Tratamento quando o tempo acaba -> VOLTA PARA A TELA INICIAL
function tempoEsgotado() {
  jogoAtivo = false; // Jogo parado
  
  screenGame.classList.remove('active');
  screenResult.classList.add('active');
  resultMessage.innerText = "TEMPO ESGOTADO! ⏱️";
  resultMessage.style.color = "#f1c40f"; // Amarelo

  // Após o feedback, volta para a tela de introdução
  setTimeout(() => {
    screenResult.classList.remove('active');
    screenIntro.classList.add('active');
  }, 3500); // Dá um tempo maior para ver a mensagem
}

// Conferir resposta do jogador com animações
function verificarResposta(opcaoSelecionada) {
  if (!jogoAtivo) return; // Previne cliques múltiplos ou após timeout
  clearInterval(timerInterval);

  const q = perguntasSorteadas[perguntaAtualIndex];
  const indiceCorreto = q.correta;

  // APLICA AS CLASSES DE FEEDBACK NOS BOTÕES DO GAME
  if (opcaoSelecionada === indiceCorreto) {
    // Acertou: Pisca o escolhido em verde
    optionButtons[opcaoSelecionada].classList.add('correta');
  } else {
    // Errou: Mostra o escolhido em vermelho
    optionButtons[opcaoSelecionada].classList.add('incorreta');
    // E pisca o correto em verde
    optionButtons[indiceCorreto].classList.add('correta');
  }

  // Pequeno delay ANTES de ir para a tela de resultado, para ver a piscada
  setTimeout(() => {
    screenGame.classList.remove('active');
    screenResult.classList.add('active');

    if (opcaoSelecionada === indiceCorreto) {
        resultMessage.innerText = "RESPOSTA CORRETA! 🎉";
        resultMessage.style.color = "#2ecc71"; // Verde
    } else {
        resultMessage.innerText = "RESPOSTA INCORRETA! ❌";
        resultMessage.style.color = "#e74c3c"; // Vermelho
    }

    agendarProximaPergunta();
  }, 2000); // Espera 2 segundos com os botões coloridos
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
      // Acabaram as perguntas, jogo finalizado
      jogoAtivo = false;
      screenResult.classList.remove('active');
      screenIntro.classList.add('active');
    }
  }, 2500); // Tempo na tela de resultado
}

// Escutar teclas do teclado (simulando botões físicos ou Raspberry)
document.addEventListener('keydown', (event) => {
  if (screenIntro.classList.contains('active')) {
    iniciarJogo();
    return;
  }

  if (screenGame.classList.contains('active') && jogoAtivo) {
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
