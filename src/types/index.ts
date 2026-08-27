// Tipos compartilhados, espelhando os DTOs do backend NestJS.

export type Role = 'user' | 'admin' | 'master';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  needsSchoolReregistration: boolean;
  schoolRejectionReason?: string | null;
  needsConsentReacceptance: boolean;
  currentConsentVersion: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface Goal {
  id: number;
  number: number;
  name: string;
  color: string;
}

export interface GameDifficulty {
  id: string;
  title: string;
  numberQuestions: number | null;
}

export interface PublicOption {
  id: number;
  text: string;
}

export interface QuestionPublic {
  id: number;
  text: string;
  goalNumber: number;
  difficulty: number;
  options: PublicOption[];
}

export type GameStatus = 'in_progress' | 'finished';

export interface GameState {
  gameId: string;
  score: number;
  streak: number;
  answered: number;
  totalQuestions: number | null;
  powerups: Record<string, boolean>;
  status: GameStatus;
  endsOnWrong: boolean;
}

export interface NextQuestionResponse {
  question: QuestionPublic | null;
  state: GameState;
  finished: boolean;
}

export interface AnswerResult {
  isCorrect: boolean;
  correctOptionId: number;
  earnedPoints: number;
  state: GameState;
  finished: boolean;
  eliminated: boolean;
}

export interface PowerupResult {
  powerup: string;
  removedOptionIds?: number[];
  audienceDistribution?: Record<number, number>;
  next?: NextQuestionResponse;
  state: GameState;
}

export interface FinishGameResponse {
  gameId: string;
  finalScore: number;
  totalAnswered: number;
  totalCorrect: number;
}

export interface RankingEntry {
  id: number;
  user: { id: number; name: string };
  score: number;
  completedAt: string;
}

// ----- Geo -----
export interface GeoItem {
  id: number;
  name: string;
  code?: string;
}

// ----- Escolas / escolaridade (admin) -----
export interface EducationLevel {
  id: number;
  name: string;
}

export interface CityRef {
  id: number;
  name: string;
  state?: { id: number; code: string; name: string };
}

export interface School {
  id: number;
  name: string;
  city: CityRef;
  educationLevels: EducationLevel[];
}

export type SuggestionStatus = 'pending' | 'approved' | 'rejected' | 'linked';

export interface SchoolSuggestion {
  id: number;
  name: string;
  city: CityRef;
  note?: string | null;
  status: SuggestionStatus;
  rejectionReason?: string | null;
  suggestedBy?: { id: number; name: string; email: string } | null;
  createdSchool?: { id: number; name: string } | null;
  createdAt: string;
  resolvedAt?: string | null;
}

// ----- Usuários (admin) -----
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role?: { id: number; name: Role } | null;
  school?: { id: number; name: string } | null;
  educationLevel?: { id: number; name: string } | null;
  createdAt: string;
}

// ----- Perguntas (manutenção admin) -----
export interface AdminQuestionOption {
  id: number;
  text: string;
}

export interface AdminQuestion {
  id: number;
  text: string;
  goal: { id: number; number: number; name: string };
  answerOptionId: number | null;
  difficulty: number;
  source?: string | null;
  isActive: boolean;
  educationLevel?: { id: number; name: string } | null;
  options: AdminQuestionOption[];
}

// ----- Dashboard -----
export interface DashboardOverview {
  totalRespostas: number;
  totalAcertos: number;
  taxaAcerto: number;
  tempoMedioMs: number;
  totalPartidas: number;
  totalParticipantes: number;
}

export interface OdsBreakdownRow {
  goalNumber: number;
  goalName: string;
  totalRespostas: number;
  totalAcertos: number;
  taxaAcerto: number;
  tempoMedioMs: number;
}

export interface RegionBreakdownRow {
  level: string;
  regionId: number;
  regionLabel: string;
  totalRespostas: number;
  taxaAcerto: number;
  tempoMedioMs: number;
  totalParticipantes: number;
}

export interface QuestionBreakdownRow {
  questionId: number;
  questionText: string;
  goalNumber: number;
  totalRespostas: number;
  taxaAcerto: number;
  tempoMedioMs: number;
}

export type RegionLevel = 'state' | 'city' | 'school';

export interface DashboardFilter {
  goalNumber?: number;
  stateId?: number;
  cityId?: number;
  schoolId?: number;
  educationLevelId?: number;
  from?: string;
  to?: string;
  level?: RegionLevel;
}

// ---------------------------------------------------------------------------
// Chat com IA — assistente de análise (admin). Ver .specs/06-chat-ia.md.
// ---------------------------------------------------------------------------

export interface ChatConversa {
  id: string;
  titulo: string;
  criadaEm: string;
  atualizadaEm: string;
}

/** Trecho da base de conhecimento que sustentou a resposta. */
export interface TrechoCitado {
  trechoId: number;
  documentoId: number;
  fonte: string;
  titulo: string;
  texto: string;
  similaridade: number;
}

/**
 * Um passo do raciocínio do assistente. É o que torna o RAG auditável na
 * interface: mostra o que foi recuperado e quais consultas foram feitas.
 */
export type PassoDoAssistente =
  | {
      tipo: 'recuperacao';
      trechos: Array<{ fonte: string; titulo: string; similaridade: number }>;
    }
  | {
      tipo: 'ferramenta';
      nome: string;
      argumentos: Record<string, unknown>;
      resumo: string;
      erro?: string;
    };

/** Como o valor do gráfico deve ser formatado. */
export type FormatoDeValor = 'percentual' | 'contagem' | 'tempo';

export interface ItemDoGrafico {
  rotulo: string;
  valor: number;
  /** 0..1 — comprimento relativo da barra, calculado no back-end. */
  proporcao: number;
  detalhe?: string;
  /** Só vem preenchida quando a cor carrega identidade (ODS). */
  cor?: string;
}

/**
 * Gráfico montado pelo back-end a partir de uma consulta real. Os números nunca
 * vêm do modelo — ver `.specs/06-chat-ia.md`, seção "Gráficos".
 */
/** Uma célula do heatmap: o cruzamento de duas dimensões. */
export interface CelulaDoGrafico {
  linha: string;
  coluna: string;
  /** null = cruzamento sem dado — diferente de ter valor zero. */
  valor: number | null;
  /** 0..1 — posição na rampa de cor. */
  intensidade: number;
  detalhe?: string;
}

/** Uma série nomeada, para barras agrupadas. */
export interface SerieDoGrafico {
  nome: string;
  cor: string;
  /** Valores na mesma ordem de `itens`. */
  valores: number[];
}

export interface EspecificacaoDeGrafico {
  tipo: 'barras' | 'indicador' | 'barras_agrupadas' | 'matriz';
  titulo: string;
  formato: FormatoDeValor;
  itens: ItemDoGrafico[];
  series?: SerieDoGrafico[];
  celulas?: CelulaDoGrafico[];
  linhas?: string[];
  colunas?: string[];
  fonte: string;
  nota?: string;
}

export type TipoDeAcao =
  | 'aprovar_sugestao_escola'
  | 'vincular_sugestao_escola'
  | 'rejeitar_sugestao_escola'
  | 'definir_pergunta_ativa'
  | 'criar_pergunta'
  | 'editar_pergunta';

export interface AvisoDaAcao {
  nivel: 'atencao' | 'informacao';
  texto: string;
}

/**
 * Ação proposta pelo assistente — **não executada**. A execução depende do
 * clique do administrador e passa pelo endpoint de sempre, com guard e
 * auditoria. Ver `.specs/06-chat-ia.md`, seção "Ações administrativas".
 */
export interface AcaoProposta {
  id: string;
  tipo: TipoDeAcao;
  resumo: string;
  detalhes: Array<{ rotulo: string; valor: string }>;
  avisos: AvisoDaAcao[];
  requisicao: {
    metodo: 'POST' | 'PATCH';
    caminho: string;
    corpo: Record<string, unknown>;
  };
}

export interface ChatMensagem {
  id: number;
  papel: 'usuario' | 'assistente';
  conteudo: string;
  passos?: PassoDoAssistente[] | null;
  graficos?: EspecificacaoDeGrafico[] | null;
  acoes?: AcaoProposta[] | null;
  /** Respostas rápidas: clicar envia a frase como próxima pergunta. */
  sugestoes?: string[] | null;
  criadaEm: string;
}

export interface ChatResposta {
  mensagem: ChatMensagem;
  trechosCitados: TrechoCitado[];
}

export interface ChatStatus {
  habilitado: boolean;
  trechosIndexados: number;
  modelo: string;
}
