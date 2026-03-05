"use client";

import { useState, useCallback } from "react";
import { QuizQuestion as QuizQuestionType } from "@/lib/types";
import QuizQuestion from "./QuizQuestion";
import QuizResults from "./QuizResults";

type Phase = "intro" | "question" | "results";

export default function QuizClient({ questions }: { questions: QuizQuestionType[] }) {
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
        // Use a timeout to ensure answers state is committed before showing results
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
          <div className="text-6xl mb-6">🧠</div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: "#1A1A2E" }}>Ukraine & Europe Quiz</h1>
          <p className="text-gray-600 max-w-xl mx-auto mb-8 text-lg">
            Test your knowledge of Ukraine&apos;s European identity, history, and EU integration journey.{" "}
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
        />
      )}
    </>
  );
}
