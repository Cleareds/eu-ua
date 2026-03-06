"use client";

import { useState, useCallback } from "react";
import { QuizQuestion as QuizQuestionType } from "@/lib/types";
import QuizQuestion from "./QuizQuestion";
import QuizResults from "./QuizResults";

type Phase = "intro" | "question" | "results";

interface Props {
  questions: QuizQuestionType[];
  categoryTitle: string;
  categoryIcon: string;
  onBack: () => void;
}

export default function QuizClient({ questions, categoryTitle, categoryIcon, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(questions.length).fill(null));
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const handleStart = useCallback(() => {
    setPhase("question");
    setCurrentIndex(0);
    setAnswers(Array(questions.length).fill(null));
    setSelectedAnswer(null);
  }, [questions.length]);

  const handleAnswer = useCallback((index: number, questionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = index;
      return next;
    });
    setSelectedAnswer(index);
  }, []);

  const handleNext = useCallback((finalAnswers: (number | null)[]) => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= questions.length) {
        setPhase("results");
        return prev;
      }
      setSelectedAnswer(finalAnswers[next] ?? null);
      return next;
    });
  }, [questions.length]);

  return (
    <>
      {phase === "intro" && (
        <div className="text-center">
          <button
            onClick={onBack}
            className="mb-8 text-sm text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1 mx-auto"
          >
            ← All categories
          </button>
          <div className="text-6xl mb-6">{categoryIcon}</div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: "#1A1A2E" }}>{categoryTitle}</h1>
          <p className="text-gray-600 max-w-xl mx-auto mb-8 text-lg">
            {questions.length} questions — how well do you know Ukraine?
          </p>
          <div className="flex justify-center gap-8 mb-10">
            {[
              { icon: "❓", label: `${questions.length} Questions` },
              { icon: "⏱️", label: "~5 minutes" },
              { icon: "📚", label: "Educational" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-xs text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>
          <button
            onClick={handleStart}
            className="px-10 py-4 rounded-xl font-bold text-lg transition-all hover:opacity-90 hover:scale-105"
            style={{ backgroundColor: "#003399", color: "white" }}
          >
            Start Quiz →
          </button>
        </div>
      )}

      {phase === "question" && (
        <QuizQuestion
          question={questions[currentIndex]}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          selectedAnswer={selectedAnswer}
          onAnswer={(idx) => handleAnswer(idx, currentIndex)}
          onNext={() => handleNext(answers)}
        />
      )}

      {phase === "results" && (
        <QuizResults
          questions={questions}
          answers={answers}
          onRetry={handleStart}
          onBack={onBack}
        />
      )}
    </>
  );
}
