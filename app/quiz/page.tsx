"use client";

import { useState } from "react";
import quizData from "@/data/quiz.json";
import { QuizQuestion as QuizQuestionType } from "@/lib/types";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import QuizResults from "@/components/quiz/QuizResults";

type Phase = "intro" | "question" | "results";

export default function QuizPage() {
  const questions = quizData as QuizQuestionType[];
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  function handleStart() {
    setPhase("question");
    setCurrentIndex(0);
    setAnswers(Array(questions.length).fill(null));
    setSelectedAnswer(null);
  }

  function handleAnswer(index: number) {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = index;
    setAnswers(newAnswers);
    setSelectedAnswer(index);
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      setPhase("results");
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(answers[currentIndex + 1]);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {phase === "intro" && (
        <div className="text-center">
          <div className="text-6xl mb-6">🧠</div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: "#1A1A2E" }}>Ukraine & Europe Quiz</h1>
          <p className="text-gray-600 max-w-xl mx-auto mb-8 text-lg">
            Test your knowledge of Ukraine's European identity, history, and EU integration journey.
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
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      )}

      {phase === "results" && (
        <QuizResults
          questions={questions}
          answers={answers}
          onRetry={handleStart}
        />
      )}
    </div>
  );
}
