# Airline Manager 4 Bot

E aí! Esse bot foi feito pra dar uma força no Airline Manager 4. No momento, ele faz algumas coisas legais:

- Compra combustível quando chega no preço que você quer.
- Compra CO2 pelo preço que você definir.
- Manda voos decolarem de forma automática.

## Como colocar pra rodar

1. **Primeiro, instale tudo**:
   Vai na pasta do projeto abre o cmd e dá um:
   ```
   npm install
   ```

2. **Bora configurar**:
   Coloca suas informações no arquivo `.env`:
   ```
   EMAIL="teuemail@email.com"
   SENHA="tuasenha"
   ```

3. **Manda ver**:
   Abre um cmd na pasta do projeto e digita:
   ```
   node app.mjs
   ```
   Aí é só ver a mágica acontecer na tela conforme o que você configurou no .env. Os detalhes de cada função estão aí embaixo.

## O que esse bot faz

### Comprar Combustível

O bot fica de olho no preço do combustível e compra automaticamente quando bater o preço que você definiu. Ele dá uma olhada nos preços a cada 30 minutos.

### Comprar CO2

Quase igual ao combustível, mas ele fica de olho no CO2. Ele verifica o preço a cada 31 minutos.

### Decolar Voos

Esse aqui faz os voos decolarem sozinhos. Você pode escolher de quanto em quanto tempo quer que isso aconteça, entre 1 e 24 horas.

## Outra Coisa!

- Os tempos pra checar os preços de combustível e CO2 são de 30 e 31 minutos, tá? Se quiser mudar, vai ter que dar uma mexida no código.
- E não esquece de ajustar o tempo que você quer que os aviões decolem, tá bom? Dá pra escolher entre 1 e 24 horas.
