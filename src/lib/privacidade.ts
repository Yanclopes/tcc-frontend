/**
 * Versao vigente do termo de privacidade — fonte unica.
 *
 * Estava duplicada em PrivacyPage.tsx e RegisterPage.tsx, com o mesmo literal
 * escrito duas vezes. Duas copias de uma constante que PRECISA casar divergem
 * em silencio: o cadastro gravaria o aceite de uma versao e a pagina exibiria
 * outra, sem erro em lugar nenhum.
 *
 * O back-end tem a sua propria referencia (PRIVACY_VERSION no ambiente, com
 * este mesmo valor como padrao). Ao mudar aqui, mudar la tambem — e o mesmo
 * valor que decide se o usuario cai na tela de reaceite ao entrar.
 *
 * ATENCAO: alterar esta constante forca TODOS os participantes ativos a
 * reaceitar o termo no proximo login. Publique entre aplicacoes com turmas,
 * nunca durante uma coleta em andamento.
 */
export const VERSAO_DO_TERMO = '2026-10-v2';

/** Data da ultima revisao, exibida junto da versao. */
export const TERMO_ATUALIZADO_EM = '6 de outubro de 2026';
