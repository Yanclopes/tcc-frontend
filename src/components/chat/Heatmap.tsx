import type { CelulaDoGrafico } from '@/types';

/**
 * Rampa sequencial de UM tom só, clara → escura.
 *
 * Validada com o script da orientação de visualização: luminosidade monotônica,
 * degraus visíveis entre passos e o extremo claro destacando do fundo. Não
 * inventar passos nem trocar por arco-íris — magnitude se lê por intensidade,
 * não por matiz.
 */
const RAMPA = ['#6fb8dc', '#4d9ecb', '#2f80b8', '#13639b', '#084670'];

/** Fundo de célula sem dado — cinza neutro, distinto de "valor baixo". */
const SEM_DADO = '#f1f5f9';

function corDaCelula(intensidade: number): string {
  const indice = Math.min(RAMPA.length - 1, Math.floor(intensidade * RAMPA.length));
  return RAMPA[Math.max(0, indice)];
}

/** A partir daqui o texto sobre a cor precisa ser claro para continuar legível. */
const LIMITE_TEXTO_CLARO = 0.6;

/**
 * Heatmap de duas dimensões.
 *
 * A forma certa quando o dado cruza duas dimensões — escolaridade × ODS em
 * barras viraria uma parede ilegível de dezenas de barras.
 *
 * O valor é escrito dentro de cada célula, e não só na cor: quem não distingue
 * as cores precisa conseguir ler o número.
 */
export function Heatmap({
  celulas,
  linhas,
  colunas,
  formatar,
}: {
  celulas: CelulaDoGrafico[];
  linhas: string[];
  colunas: string[];
  formatar: (valor: number) => string;
}) {
  const porChave = new Map(celulas.map((c) => [`${c.linha}|${c.coluna}`, c]));

  return (
    <div className="overflow-x-auto">
      <table className="border-separate border-spacing-0.5 text-xs">
        <thead>
          <tr>
            <th scope="col" className="sr-only">
              Categoria
            </th>
            {colunas.map((coluna) => (
              <th
                key={coluna}
                scope="col"
                className="px-1 pb-1 text-center font-medium text-slate-500"
              >
                {coluna.replace('ODS ', '')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={linha}>
              <th
                scope="row"
                className="max-w-[9rem] truncate pr-2 text-right font-medium text-slate-600"
                title={linha}
              >
                {linha}
              </th>
              {colunas.map((coluna) => {
                const celula = porChave.get(`${linha}|${coluna}`);

                if (!celula || celula.valor === null) {
                  return (
                    <td
                      key={coluna}
                      className="h-8 w-11 rounded text-center text-slate-300"
                      style={{ backgroundColor: SEM_DADO }}
                      title={`${linha} · ${coluna}: sem resposta`}
                    >
                      —
                    </td>
                  );
                }

                const claro = celula.intensidade >= LIMITE_TEXTO_CLARO;
                return (
                  <td
                    key={coluna}
                    className="h-8 w-11 rounded text-center font-semibold tabular-nums"
                    style={{
                      backgroundColor: corDaCelula(celula.intensidade),
                      color: claro ? '#ffffff' : '#0f172a',
                    }}
                    title={`${linha} · ${coluna}: ${formatar(celula.valor)}${
                      celula.detalhe ? ` (${celula.detalhe})` : ''
                    }`}
                  >
                    {Math.round(celula.valor)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legenda da escala: sem ela a intensidade não tem referência. */}
      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
        <span>menor</span>
        <div className="flex gap-0.5">
          {RAMPA.map((cor) => (
            <span key={cor} className="h-3 w-5 rounded-sm" style={{ backgroundColor: cor }} />
          ))}
        </div>
        <span>maior</span>
        <span className="ml-2 flex items-center gap-1">
          <span className="h-3 w-5 rounded-sm" style={{ backgroundColor: SEM_DADO }} />
          sem resposta
        </span>
      </div>
    </div>
  );
}
