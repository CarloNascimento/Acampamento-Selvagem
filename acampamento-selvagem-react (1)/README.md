# Acampamento Selvagem

Jogo de sobrevivência por turnos feito com React e TypeScript. O objetivo é conseguir 50 madeiras sem deixar a vida ou a energia chegar a zero.

## Executar

```bash
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite no terminal.

## O que foi usado

- `useState` para guardar os dados atuais da partida;
- `useEffect` para salvar as mudanças no `localStorage`;
- eventos de clique para as quatro ações;
- renderização condicional para bloqueios e fim do jogo;
- CSS Modules para limitar os estilos ao componente;
- TypeScript para definir o formato do estado.

