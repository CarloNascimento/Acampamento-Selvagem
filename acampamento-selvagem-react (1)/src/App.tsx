import { useEffect, useState } from "react";
import styles from "./style.module.css";

type Situacao = "em andamento" | "venceu" | "perdeu";

type Jogo = {
  vida: number;
  energia: number;
  mantimentos: number;
  madeira: number;
  acoesComuns: number;
  aviso: string;
  historico: string[];
  situacao: Situacao;
};

const CHAVE_JOGO = "acampamento-salvo";

const estadoInicial: Jogo = {
  vida: 100,
  energia: 100,
  mantimentos: 4,
  madeira: 0,
  acoesComuns: 0,
  aviso: "Você chegou ao acampamento. Escolha sua primeira ação.",
  historico: [],
  situacao: "em andamento",
};

function lerJogoSalvo(): Jogo {
  const salvo = localStorage.getItem(CHAVE_JOGO);
  if (salvo === null) return estadoInicial;

  try {
    return JSON.parse(salvo) as Jogo;
  } catch {
    return estadoInicial;
  }
}

function limitar(valor: number) {
  return Math.max(0, Math.min(100, valor));
}

function conferirResultado(jogo: Jogo): Jogo {
  if (jogo.vida <= 0 || jogo.energia <= 0) {
    return { ...jogo, situacao: "perdeu", aviso: "Fim de jogo: você não conseguiu manter o acampamento." };
  }

  if (jogo.madeira >= 50) {
    return { ...jogo, situacao: "venceu", aviso: "Missão cumprida! O abrigo foi concluído com 50 madeiras." };
  }

  return jogo;
}

function App() {
  const [jogo, setJogo] = useState<Jogo>(lerJogoSalvo);

  useEffect(() => {
    localStorage.setItem(CHAVE_JOGO, JSON.stringify(jogo));
  }, [jogo]);

  function atualizarJogo(mudancas: (anterior: Jogo) => Partial<Jogo>, mensagem: string, foiExploracao = false) {
    setJogo((anterior) => {
      if (anterior.situacao !== "em andamento") return anterior;

      const atualizado: Jogo = {
        ...anterior,
        ...mudancas(anterior),
        aviso: mensagem,
        historico: [...anterior.historico, mensagem],
        acoesComuns: foiExploracao ? 0 : anterior.acoesComuns + 1,
      };

      return conferirResultado(atualizado);
    });
  }

  function explorar() {
    const evento = Math.floor(Math.random() * 5);

    if (evento === 0) {
      atualizarJogo((anterior) => ({ mantimentos: anterior.mantimentos + 2 }), "Você encontrou duas porções de alimento.", true);
    } else if (evento === 1) {
      atualizarJogo((anterior) => ({ madeira: anterior.madeira + 10 }), "A exploração rendeu 10 madeiras.", true);
    } else if (evento === 2) {
      atualizarJogo((anterior) => ({ vida: limitar(anterior.vida - 35) }), "Um animal selvagem atacou você. Vida reduzida.", true);
    } else if (evento === 3) {
      atualizarJogo((anterior) => ({ energia: limitar(anterior.energia - 30) }), "A trilha foi longa e consumiu bastante energia.", true);
    } else {
      atualizarJogo(() => ({}), "A área estava vazia. Nada foi encontrado.", true);
    }
  }

  function descansar() {
    atualizarJogo(
      (anterior) => ({ energia: limitar(anterior.energia + 30), vida: limitar(anterior.vida + 5) }),
      "Você descansou perto da fogueira e recuperou forças."
    );
  }

  function alimentar() {
    atualizarJogo(
      (anterior) => ({ mantimentos: anterior.mantimentos - 1, vida: limitar(anterior.vida + 20) }),
      "Você usou um mantimento e recuperou vida."
    );
  }

  function coletarMadeira() {
    atualizarJogo(
      (anterior) => ({ energia: limitar(anterior.energia - 25), madeira: anterior.madeira + 10 }),
      "Você gastou energia e coletou 10 madeiras."
    );
  }

  function reiniciar() {
    setJogo({ ...estadoInicial });
  }

  const terminou = jogo.situacao !== "em andamento";
  const precisaExplorar = jogo.acoesComuns >= 2;

  return (
    <main className={styles.pagina}>
      <div className={styles.janela}>
        <aside className={styles.lateral}>
          <div>
            <p className={styles.marca}>EXPEDIÇÃO 50</p>
            <h1>Acampamento<br />Selvagem</h1>
            <p className={styles.objetivo}>Construa seu abrigo antes que a floresta vença.</p>
          </div>

          <div className={styles.statusLista}>
            <div className={styles.statusItem}>
              <div><span>Vida</span><strong>{jogo.vida}%</strong></div>
              <div className={styles.barra}><i style={{ width: `${jogo.vida}%` }} /></div>
            </div>
            <div className={styles.statusItem}>
              <div><span>Energia</span><strong>{jogo.energia}%</strong></div>
              <div className={styles.barra}><i style={{ width: `${jogo.energia}%` }} /></div>
            </div>
            <div className={styles.inventario}>
              <div><span>Mantimentos</span><strong>{jogo.mantimentos}</strong></div>
              <div><span>Madeira</span><strong>{jogo.madeira}/50</strong></div>
            </div>
          </div>

          <p className={styles.meta}>META: 50 MADEIRAS</p>
        </aside>

        <section className={styles.conteudo}>
          <header className={styles.topo}>
            <div>
              <span>PAINEL DA EXPEDIÇÃO</span>
              <h2>Qual será seu próximo passo?</h2>
            </div>
            <div className={styles.turno}>TURNO {jogo.historico.length + 1}</div>
          </header>

          <div className={`${styles.aviso} ${terminou ? styles.avisoFinal : ""}`}>
            <span>ACONTECIMENTO ATUAL</span>
            <p>{jogo.aviso}</p>
          </div>

          {!terminou && (
            <div className={styles.regraTurno}>
              <span>Ações comuns neste ciclo: {jogo.acoesComuns}/2</span>
              <strong>{precisaExplorar ? "Agora você precisa explorar." : "Você ainda pode escolher qualquer ação."}</strong>
            </div>
          )}

          <div className={styles.botoes}>
            <button onClick={explorar} disabled={terminou}>
              <span>01</span><strong>Explorar</strong><small>Evento surpresa</small>
            </button>
            <button onClick={descansar} disabled={terminou || precisaExplorar}>
              <span>02</span><strong>Descansar</strong><small>+30 energia, +5 vida</small>
            </button>
            <button onClick={alimentar} disabled={terminou || precisaExplorar || jogo.mantimentos === 0}>
              <span>03</span><strong>Alimentar-se</strong><small>-1 mantimento, +20 vida</small>
            </button>
            <button onClick={coletarMadeira} disabled={terminou || precisaExplorar || jogo.energia < 25}>
              <span>04</span><strong>Coletar madeira</strong><small>-25 energia, +10 madeira</small>
            </button>
          </div>

          {terminou && <button className={styles.reiniciar} onClick={reiniciar}>Começar nova expedição</button>}

          <section className={styles.historico}>
            <div className={styles.historicoTitulo}>
              <h2>Registro de campo</h2>
              <span>{jogo.historico.length} acontecimentos</span>
            </div>
            {jogo.historico.length === 0 ? (
              <p className={styles.vazio}>Seu diário ainda está vazio.</p>
            ) : (
              <ol>
                {[...jogo.historico].reverse().map((texto, indice) => (
                  <li key={`${texto}-${indice}`}><b>{jogo.historico.length - indice}</b><span>{texto}</span></li>
                ))}
              </ol>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

export default App;
