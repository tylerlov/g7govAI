
export enum Score {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED',
}

export interface ScorecardItem {
  topic: string;
  score: Score;
  summary: string;
  plainLanguageExplanation: string;
  contractClause: string;
  modelClause: string;
  sectionReference: string;
}

export type ScorecardData = ScorecardItem[];

export type AppState = 'idle' | 'analyzing' | 'results' | 'generating_addendum' | 'error';
