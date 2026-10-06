import { ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { TERMO_ATUALIZADO_EM, VERSAO_DO_TERMO } from '@/lib/privacidade';

/**
 * Politica de privacidade versionada (LGPD). O texto aqui precisa descrever o
 * que o sistema REALMENTE faz: cada afirmacao abaixo foi conferida contra o
 * codigo. Ao alterar o texto, suba a versao em `@/lib/privacidade` — isso forca
 * reaceite no proximo login de todo mundo.
 */
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
            Versão {VERSAO_DO_TERMO} · Atualizada em {TERMO_ATUALIZADO_EM}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="prose prose-slate max-w-none space-y-5 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-slate-900">1. Quem somos</h2>
            <p>
              O <strong>Desafio ODS</strong> é uma plataforma gamificada desenvolvida como
              Trabalho de Conclusão de Curso do Bacharelado em Sistemas de Informação da
              UNIDAVI (Rio do Sul, SC). Seu objetivo é levantar o nível de conhecimento
              da população sobre os 17 Objetivos de Desenvolvimento Sustentável (ODS) da
              Agenda 2030 da ONU.
            </p>
            <p>
              O responsável pelo tratamento dos dados (controlador) é{' '}
              <strong>Yan Capistrano Lopes</strong>, pesquisador responsável, sob
              orientação do curso de Sistemas de Informação da UNIDAVI. Os canais de
              contato estão na seção 11.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">2. Quais dados coletamos</h2>
            <p>Ao criar sua conta, são obrigatórios:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Nome e endereço de e-mail;</li>
              <li>
                Senha, guardada apenas como <em>hash</em> criptográfico — nunca em texto
                legível;
              </li>
              <li>Nível de escolaridade;</li>
              <li>
                <strong>Estado e cidade</strong>, que permitem o recorte regional da
                pesquisa;
              </li>
              <li>
                <strong>Escola</strong> — escolhida no catálogo ou, se ela não estiver
                lá, sugerida por você para que um administrador a cadastre. Um dos dois
                é necessário para concluir o cadastro.
              </li>
            </ul>
            <p>Durante o uso, são registrados os dados gerados por cada partida:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Pergunta apresentada e alternativa escolhida;</li>
              <li>Indicador de acerto e tempo de resposta;</li>
              <li>Ordem da pergunta na partida e ajuda utilizada, quando houver;</li>
              <li>Momento em que cada resposta foi registrada.</li>
            </ul>
            <p>
              Ações administrativas sobre a sua conta — como a aprovação ou a rejeição de
              uma escola que você sugeriu — geram um registro em trilha de auditoria,
              mantido para fins de governança da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">3. Para que usamos os dados</h2>
            <p>
              Os dados coletados alimentam indicadores agregados do levantamento — taxa
              de acerto por ODS, por escolaridade e por região —, apresentados no painel
              administrativo da plataforma e utilizados como resultado da pesquisa
              acadêmica. Nenhum dado individual é publicado ou compartilhado sem
              anonimização.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">
              4. Base legal e consentimento
            </h2>
            <p>
              O tratamento se baseia no seu{' '}
              <strong>consentimento livre e informado</strong> (LGPD, Lei nº 13.709/2018,
              art. 7º, I), obtido no momento do cadastro. Registramos a versão do termo
              aceita por você; quando o texto é revisado, pedimos o aceite da nova versão
              no login seguinte. Você pode revogar o consentimento a qualquer momento,
              conforme a seção 8.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">
              5. Participantes menores de idade
            </h2>
            <p>
              A plataforma é aplicada em ambiente escolar e pode ser usada por crianças e
              adolescentes. Nos termos do art. 14 da LGPD, o tratamento de dados de
              menores de 12 anos exige{' '}
              <strong>
                consentimento específico de ao menos um dos pais ou responsável legal
              </strong>
              , e o tratamento de dados de adolescentes observa o seu melhor interesse.
            </p>
            <p>
              Por isso, a participação de estudantes menores de idade ocorre mediante
              autorização prévia da instituição de ensino e dos responsáveis, recolhida
              fora da plataforma pelo pesquisador. O aceite marcado nesta tela, por si
              só, não substitui essa autorização.
            </p>
            <p>
              Responsáveis podem solicitar acesso, correção ou exclusão dos dados do
              menor pelos canais da seção 11.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">
              6. Onde os dados ficam armazenados
            </h2>
            <p>
              A plataforma é hospedada na Amazon Web Services, na região{' '}
              <strong>Norte da Virgínia, nos Estados Unidos</strong>, e o tráfego passa
              pela rede da Cloudflare, de alcance global. Isso significa que seus dados{' '}
              <strong>são armazenados e processados fora do Brasil</strong>.
            </p>
            <p>
              Essa transferência internacional ocorre com base no seu consentimento
              específico para esta finalidade (LGPD, art. 33, VIII), informado neste
              termo antes do cadastro. Os fornecedores citados adotam cláusulas
              contratuais e salvaguardas de proteção de dados em seus próprios termos de
              serviço.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">
              7. Com quem compartilhamos
            </h2>
            <p>
              Não vendemos, alugamos nem cedemos dados pessoais. Para funcionar, a
              plataforma se apoia em três fornecedores que atuam como operadores:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Amazon Web Services</strong> — servidor e banco de dados onde as
                informações ficam armazenadas;
              </li>
              <li>
                <strong>Cloudflare</strong> — entrega do site e proteção contra ataques;
                processa o endereço IP de quem acessa;
              </li>
              <li>
                <strong>Grafana Cloud</strong> — monitoramento técnico do servidor.
                Recebe apenas indicadores de desempenho, como tempo de resposta e volume
                de requisições, sem dados pessoais.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">
              8. Seus direitos (art. 18 da LGPD)
            </h2>
            <p>Como titular dos dados, você pode a qualquer momento, na página <em>Meu perfil</em>:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Acessar e baixar</strong> todos os seus dados em formato legível
                por máquina (JSON);
              </li>
              <li>
                <strong>Anonimizar sua conta</strong>: seu nome e e-mail são substituídos
                por identificadores anônimos e o acesso é encerrado, mas{' '}
                <strong>suas respostas permanecem</strong> no conjunto da pesquisa, sem
                qualquer ligação com você;
              </li>
              <li>
                <strong>Excluir sua conta</strong>: a conta e{' '}
                <strong>todos os dados vinculados a ela</strong> — partidas, respostas,
                sugestões de escola e posições no ranking — são apagados. A exclusão é
                imediata e irreversível, e suas respostas deixam de integrar a pesquisa.
              </li>
            </ul>
            <p>
              As duas últimas opções existem porque servem a objetivos diferentes: a
              anonimização encerra o vínculo com você preservando a utilidade científica
              das respostas; a exclusão remove tudo. A escolha é sua, e nenhuma das duas
              exige justificativa.
            </p>
            <p>
              Correções de dados incorretos podem ser solicitadas pelos canais da seção
              11.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">9. Segurança</h2>
            <p>
              Senhas são armazenadas apenas em forma de <em>hash</em> (bcrypt) e nunca em
              texto claro. O acesso à plataforma é feito por conexão criptografada
              (HTTPS). O acesso aos dados brutos individuais é restrito às contas com
              papel de administrador, atribuído apenas ao pesquisador responsável e a
              quem ele designar.
            </p>
            <p>
              Seu token de acesso fica guardado no armazenamento local do seu navegador e
              é descartado quando você sai da conta.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">10. Retenção</h2>
            <p>
              Os dados são retidos enquanto a conta existir, ou até o encerramento da
              pesquisa que originou a plataforma. Ao excluir a conta, os registros
              pessoais e as respostas vinculadas são apagados imediatamente. Ao
              anonimizar, as respostas permanecem sem identificação, conforme a seção 8.
            </p>
            <p>
              A trilha de auditoria preserva o registro das ações administrativas
              realizadas, incluindo a data em que a conta foi anonimizada ou excluída,
              para que a plataforma possa demonstrar que a solicitação foi atendida.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">11. Contato</h2>
            <p>
              Dúvidas e solicitações relacionadas a dados pessoais devem ser enviadas ao
              pesquisador responsável, <strong>Yan Capistrano Lopes</strong>, pelo
              endereço{' '}
              <a className="font-semibold text-brand-700" href="mailto:contato@ods.yan.tec.br">
                contato@ods.yan.tec.br
              </a>
              . O prazo de resposta é de até 15 dias.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
