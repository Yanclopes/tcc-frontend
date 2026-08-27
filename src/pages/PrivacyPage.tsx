import { ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

/**
 * Política de privacidade versionada (LGPD). A versão apresentada aqui deve
 * casar com CONSENT_VERSION usada no cadastro — se este texto mudar, gerar
 * uma nova versão e forçar reconsentimento no próximo login.
 */
const PRIVACY_VERSION = '2026-08-v2';
const UPDATED_AT = '26 de agosto de 2026';

export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-100 text-brand-700">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Política de Privacidade</h1>
          <p className="text-sm text-slate-500">
            Versão {PRIVACY_VERSION} · Atualizada em {UPDATED_AT}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="prose prose-slate max-w-none space-y-5 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-slate-900">1. Quem somos</h2>
            <p>
              O <strong>Desafio ODS</strong> é uma plataforma gamificada desenvolvida como Trabalho
              de Conclusão de Curso do Bacharelado em Sistemas de Informação da UNIDAVI (Rio do Sul,
              SC). Seu objetivo é levantar o nível de conhecimento da população sobre os 17
              Objetivos de Desenvolvimento Sustentável (ODS) da Agenda 2030 da ONU.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">2. Quais dados coletamos</h2>
            <p>Ao criar sua conta, coletamos:</p>
            <ul className="list-disc pl-5">
              <li>
                <strong>Obrigatórios</strong>: nome, endereço de e-mail, senha (guardada apenas como{' '}
                <em>hash</em> criptográfico) e nível de escolaridade.
              </li>
              <li>
                <strong>Opcional</strong>: escola de vínculo (pode ser sugerida se não estiver no
                catálogo).
              </li>
            </ul>
            <p>Durante o uso, coletamos os dados gerados por cada partida:</p>
            <ul className="list-disc pl-5">
              <li>Pergunta apresentada e alternativa escolhida;</li>
              <li>Indicador de acerto e tempo de resposta;</li>
              <li>Ordem da pergunta na partida e ajuda utilizada, quando houver;</li>
              <li>Momento em que cada resposta foi registrada.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">3. Para que usamos os dados</h2>
            <p>
              Os dados coletados alimentam indicadores agregados do levantamento — taxa de acerto
              por ODS, por escolaridade e por região —, apresentados no painel administrativo da
              plataforma e utilizados como resultado da pesquisa acadêmica. Nenhum dado individual é
              publicado ou compartilhado sem anonimização.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">4. Base legal e consentimento</h2>
            <p>
              O tratamento se baseia no seu <strong>consentimento livre e informado</strong>
              (LGPD, Lei nº 13.709/2018, art. 7º, I), obtido no momento do cadastro. Você pode
              revogar o consentimento a qualquer momento excluindo sua conta. Registramos a versão
              do termo aceito para rastreabilidade.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">
              5. Seus direitos (art. 18 da LGPD)
            </h2>
            <p>Como titular dos dados, você pode a qualquer momento:</p>
            <ul className="list-disc pl-5">
              <li>
                <strong>Acessar e baixar</strong> todos os seus dados em formato legível por máquina
                (JSON) na página <em>Meu perfil</em>;
              </li>
              <li>
                <strong>Excluir sua conta</strong> e todos os dados vinculados a ela (partidas,
                respostas, sugestões de escola, ranking) na mesma página — a exclusão é imediata e
                irreversível;
              </li>
              <li>
                <strong>Solicitar correção</strong> de dados incorretos entrando em contato pelos
                canais listados abaixo.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">6. Segurança</h2>
            <p>
              Senhas são armazenadas apenas em forma de <em>hash</em> (bcrypt) e nunca em texto
              claro. O acesso à plataforma é feito por conexão criptografada (HTTPS). O acesso aos
              dados brutos individuais é restrito ao administrador principal do sistema e ao
              pesquisador responsável.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">
              7. Uso de inteligência artificial e transferência internacional
            </h2>
            <p>
              O painel administrativo da plataforma conta com um assistente de inteligência
              artificial que auxilia o pesquisador a interpretar os resultados do levantamento. Esse
              assistente é operado pela OpenAI, empresa sediada nos Estados Unidos, o que
              caracteriza <strong>transferência internacional de dados</strong> (art. 33 da LGPD).
            </p>
            <p className="mt-2">
              <strong>Nenhum dado pessoal é enviado a esse serviço.</strong> O assistente recebe
              apenas resultados <em>agregados</em> — como a taxa de acerto por Objetivo de
              Desenvolvimento Sustentável, por escola ou por nível de escolaridade — e textos de
              referência sobre a metodologia da pesquisa. Não são enviados nomes, e-mails, respostas
              individuais nem qualquer informação que permita identificar um participante. Essa
              restrição é aplicada por verificação automática no servidor, além de estar prevista no
              desenho do sistema.
            </p>
            <p className="mt-2">
              O assistente é acessível apenas a administradores, nunca aos participantes, e cada
              consulta é registrada na trilha de auditoria da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">8. Retenção</h2>
            <p>
              Os dados são retidos enquanto a conta estiver ativa. Ao solicitar a exclusão, todos os
              registros pessoais são apagados imediatamente. As respostas anonimizadas que já tenham
              entrado em análise agregada permanecem no dataset consolidado da pesquisa, sem
              qualquer identificação.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">9. Contato</h2>
            <p>
              Dúvidas ou solicitações relacionadas a dados pessoais podem ser enviadas ao autor da
              pesquisa: <strong>Yan Capistrano Lopes</strong>, aluno de Sistemas de Informação,
              UNIDAVI — via o e-mail institucional informado pela coordenação do curso.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
