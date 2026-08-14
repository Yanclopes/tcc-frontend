// Tipos compartilhados, espelhando os DTOs do backend NestJS.

export type Role = 'user' | 'admin' | 'master';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
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

export type SuggestionStatus = 'pending' | 'approved' | 'rejected';

export interface SchoolSuggestion {
  id: number;
  name: string;
  city: CityRef;
  note?: string | null;
  status: SuggestionStatus;
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
