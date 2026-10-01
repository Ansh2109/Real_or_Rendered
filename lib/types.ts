export type Answer = "real" | "ai";
export type Choice = "a" | "b";
export type Category = "village" | "city";
export type Theme = "village" | "city" | "mixed";
export type Difficulty = "easy" | "medium" | "hard";

export type GameImage = {
  id: string;
  canonicalId: string;
  url: string;
  answer: Answer;
  category: Category;
  source: string;
  sourceUrl?: string;
  photographer?: string;
  isLocal: boolean;
  license?: string;
  licenseUrl?: string;
  aiModel?: string;
};

export type QuestionPayload = {
  token: string;
  publicId: string;
  category: Category;
  offlineMode: boolean;
  notice: "none" | "offline" | "backup";
  poolRemaining: number;
  totalPairs: number;
};

export type QuestionPairPayload = {
  a: QuestionPayload;
  b: QuestionPayload;
};

export type RevealPayload = {
  correct: boolean;
  timedOut: boolean;
  correctChoice: Choice;
  images: Record<
    Choice,
    {
      answer: Answer;
      category: Category;
      source: string;
      sourceUrl?: string;
      photographer?: string;
      license?: string;
      licenseUrl?: string;
      aiModel?: string;
      isLocal: boolean;
    }
  >;
};

export type GameSettings = {
  questionCount: 5 | 10 | 15 | 20;
};

export type NextImageRequest = {
  usedIds: string[];
  failedIds: string[];
  theme: Theme;
  difficulty: Difficulty;
  desiredAnswer: Answer;
  forceLocal?: boolean;
  subject?: string;
};
