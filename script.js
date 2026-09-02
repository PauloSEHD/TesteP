// Atribuição básica das teclas físicas aos botões arcade
document.addEventListener('keydown', (event) => {
  // Teclas numéricas 1, 2, 3, 4 simulando os botões da Raspberry Pi Pico W
  if (['1', '2', '3', '4'].includes(event.key)) {
    const optionIndex = parseInt(event.key) - 1;
    console.log(`Botão pressionado: Opção ${optionIndex + 1}`);
    // Lógica para conferir a resposta vai aqui
  }
});
