"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import AnswerResult from "@/components/AnswerResult";
import GameScreen from "@/components/GameScreen";
import ScoreScreen from "@/components/ScoreScreen";
import StartScreen from "@/components/StartScreen";
import { accuracyPercent, createAnswerPlan, defaultSettings, TIMER_SECONDS } from "@/lib/gameManager";
import type {
  Answer,
  Choice,
  GameSettings,
  QuestionPairPayload,
  QuestionPayload,
  RevealPayload,
} from "@/lib/types";



type Phase = "start" | "loading" | "question" | "reveal" | "score" | "error";

async function requestImage(
  answer: Answer,
  settings: GameSettings,
  usedIds: string[],
  failedIds: string[],
  subject?: string,
): Promise<QuestionPayload> {
  const response = await fetch("/api/images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usedIds,
      failedIds,
      theme: "mixed",
      difficulty: "medium",
      desiredAnswer: answer,
      forceLocal: false,
      subject,
    }),
  });
  if (!response.ok) throw new Error(`Image request failed (${response.status})`);
  const data = (await response.json()) as QuestionPayload;
  if (!data.token || !data.publicId || !data.category) {
    throw new Error("Image request returned an invalid image");
  }
  return data;
}

export default function GameApp() {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings());
  const [phase, setPhase] = useState<Phase>("start");
  const [plan, setPlan] = useState<Choice[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [failedIds, setFailedIds] = useState<string[]>([]);
  const [question, setQuestion] = useState<QuestionPairPayload | null>(null);
  const [readyIds, setReadyIds] = useState<string[]>([]);
  const [reveal, setReveal] = useState<RevealPayload | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [poolRemaining, setPoolRemaining] = useState<number | null>(null);
  const [totalPairs, setTotalPairs] = useState<number>(0);
  const fetching = useRef(false);
  const lockedRef = useRef(false);
  const imageFailureCount = useRef(0);

  const total = plan.length;
  const imagesReady =
    question !== null &&
    readyIds.includes(question.a.publicId) &&
    readyIds.includes(question.b.publicId);

  const loadQuestion = useCallback(
    async (
      nextIndex: number,
      nextPlan: Choice[],
      nextUsed: string[],
      nextFailed: string[],
    ) => {
      if (fetching.current) return;
      fetching.current = true;
      lockedRef.current = true;
      setLocked(true);
      setPhase("loading");
      setReadyIds([]);
      setReveal(null);
      setLoadError(null);

      try {
        const ai = await requestImage("ai", settings, nextUsed, nextFailed);
        if (nextUsed.includes(ai.publicId)) throw new Error("Repeated AI image");
        
        // Pass the ai.publicId (which is the filename) as the subject to fetch the exact same real image!
        const real = await requestImage(
          "real",
          settings,
          nextUsed, // Do NOT include ai.publicId in usedIds here, otherwise it will skip it!
          nextFailed,
          ai.publicId
        );
        
        // After fetching both, we consider this ID "used" for future rounds
        nextUsed.push(ai.publicId);

        const aiOn = nextPlan[nextIndex];
        const pair: QuestionPairPayload =
          aiOn === "a" ? { a: ai, b: real } : { a: real, b: ai };
        const pairIds = [pair.a.publicId, pair.b.publicId];
        setUsedIds([...nextUsed, ...pairIds]);
        // ai response always has the freshest pool count (fetched first)
        setPoolRemaining(ai.poolRemaining);
        setTotalPairs(ai.totalPairs);
        setQuestion(pair);
        setIndex(nextIndex);
        setPhase("question");
        lockedRef.current = false;
        setLocked(false);
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? `${error.message}. Check your connection or image API settings and try again.`
            : "Could not load the image pair. Check your connection and try again.",
        );
        setPhase("error");
        lockedRef.current = false;
        setLocked(false);
      } finally {
        fetching.current = false;
      }
    },
    [settings],
  );

  const startGame = () => {
    const nextPlan = createAnswerPlan(settings.questionCount);
    setPlan(nextPlan);
    setScore(0);
    setIndex(0);
    setUsedIds([]);
    setFailedIds([]);
    setNotice(null);
    void loadQuestion(0, nextPlan, [], []);
  };

  const revealAnswer = async (choice: Choice | "timeout") => {
    if (!question || lockedRef.current) return;
    lockedRef.current = true;
    setLocked(true);
    try {
      const response = await fetch("/api/images/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokens: { a: question.a.token, b: question.b.token },
          choice,
        }),
      });
      if (!response.ok) throw new Error("Could not reveal this answer");
      const data = (await response.json()) as RevealPayload;
      if (
        typeof data.correct !== "boolean" ||
        (data.correctChoice !== "a" && data.correctChoice !== "b") ||
        !data.images?.a ||
        !data.images?.b
      ) {
        throw new Error("The answer service returned an invalid response");
      }
      if (data.correct) setScore((value) => value + 1);
      setReveal(data);
      setPhase("reveal");
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Could not reveal this answer. Try again.",
      );
      setPhase("error");
    }
  };

  const onImageReady = useCallback(
    (publicId: string) => {
      setReadyIds((current) => (current.includes(publicId) ? current : [...current, publicId]));
      if (
        question &&
        [...readyIds, publicId].includes(question.a.publicId) &&
        [...readyIds, publicId].includes(question.b.publicId)
      ) {
        imageFailureCount.current = 0;
      }
    },
    [question, readyIds],
  );

  const onImageFail = useCallback(
    (publicId: string) => {
      if (!question) return;
      const nextFailed = failedIds.includes(publicId) ? failedIds : [...failedIds, publicId];
      setFailedIds(nextFailed);
      imageFailureCount.current += 1;
      if (imageFailureCount.current >= 3) {
        setLoadError("Three image pairs failed to load. Check your internet connection and retry.");
        setPhase("error");
        lockedRef.current = false;
        setLocked(false);
        return;
      }
      setNotice("A photo did not load — finding a replacement pair.");
      void loadQuestion(index, plan, usedIds, nextFailed);
    },
    [failedIds, index, loadQuestion, plan, question, usedIds],
  );

  const goNext = () => {
    const nextIndex = index + 1;
    if (nextIndex >= total) {
      setPhase("score");
      return;
    }
    void loadQuestion(nextIndex, plan, usedIds, failedIds);
  };

  const banner = useMemo(() => notice, [notice]);
  const imageSrc = (item: QuestionPayload) =>
    `/api/images/view?t=${encodeURIComponent(item.token)}`;

  return (
    <div className="game-shell">
      {phase === "start" ? (
        <StartScreen settings={settings} onChange={setSettings} onStart={startGame} />
      ) : null}

      {phase === "loading" ? (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[#f8f7f4] text-[#7a7570]">
          <div className="size-8 animate-spin rounded-full border-2 border-[#e8e5df] border-t-[#1a1916]" />
          <p className="text-sm font-medium">Finding two photographs…</p>
        </div>
      ) : null}

      {(phase === "question" || phase === "reveal") && question ? (
        <>
          <GameScreen
            index={index + 1}
            total={total}
            score={score}
            imageA={imageSrc(question.a)}
            imageB={imageSrc(question.b)}
            imageIdA={question.a.publicId}
            imageIdB={question.b.publicId}
            readyA={readyIds.includes(question.a.publicId)}
            readyB={readyIds.includes(question.b.publicId)}
            timerKey={`${question.a.publicId}-${question.b.publicId}`}
            locked={locked || !imagesReady || phase === "reveal"}
            onGuess={(choice) => void revealAnswer(choice)}
            onExpire={() => void revealAnswer("timeout")}
            onImageReady={onImageReady}
            onImageFail={onImageFail}
            onRestart={() => setPhase("start")}
            hideChoices={phase === "reveal"}
            correctChoice={reveal?.correctChoice}
          />
          {phase === "reveal" && reveal ? (
            <AnswerResult result={reveal} onNext={goNext} isLast={index + 1 >= total} />
          ) : null}
        </>
      ) : null}

      {phase === "score" ? (
        <ScoreScreen
          correct={score}
          wrong={total - score}
          total={total}
          accuracy={accuracyPercent(score, total)}
          onReplay={() => setPhase("start")}
        />
      ) : null}

      {phase === "error" ? (
        <div className="flex min-h-[100dvh] items-center justify-center bg-[#f8f7f4] px-4">
          <div className="panel w-full max-w-md px-8 py-10 text-center">
            <div className="mb-4 text-3xl">⚠️</div>
            <h1 className="font-display text-2xl font-bold text-[#1a1916]">Failed to Load</h1>
            <p className="mt-3 text-sm text-[#7a7570]">{loadError}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => void loadQuestion(index, plan, usedIds, failedIds)}
              >
                Try Again
              </button>
              <button
                type="button"
                className="choice-btn px-6 text-sm"
                onClick={() => { setLoadError(null); setPhase("start"); }}
              >
                Back to Start
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
