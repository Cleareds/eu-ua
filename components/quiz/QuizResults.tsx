import Link from "next/link";
import { QuizQuestion } from "@/lib/types";

interface Props {
  questions: QuizQuestion[];
  answers: (number | null)[];
  onRetry: () => void;
}

export default function QuizResults({ questions, answers, onRetry }: Props) {
  const score = answers.filter((a, i) => a === questions[i].correct).length;
  const total = questions.length;
  const pct = Math.round((score / total) * 100);

  const messages = [
    { min: 0, max: 1, text: "Keep exploring! There's a lot to discover about Ukraine's European journey." },
    { min: 2, max: 2, text: "Good start! You know the basics. Explore more to deepen your understanding." },
    { min: 3, max: 3, text: "Solid knowledge! You know Ukraine's European connections better than most." },
    { min: 4, max: 4, text: "Impressive! You have strong knowledge of Ukraine's European identity." },
    { min: 5, max: 5, text: "Expert level! You know Ukraine's European heritage inside and out." },
  ];

  const message = messages.find((m) => score >= m.min && score <= m.max)?.text ?? "";

  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Score circle */}
      <div className="mb-8">
        <div
          className="w-36 h-36 rounded-full flex flex-col items-center justify-center mx-auto mb-6 border-8"
          style={{ borderColor: pct >= 60 ? "#003399" : "#DC2626", backgroundColor: "white" }}
        >
          <div className="text-4xl font-bold" style={{ color: pct >= 60 ? "#003399" : "#DC2626" }}>
            {score}/{total}
          </div>
          <div className="text-sm text-gray-500">{pct}%</div>
        </div>

        <h2 className="text-2xl font-bold mb-3" style={{ color: "#1A1A2E" }}>
          {pct >= 80 ? "Excellent!" : pct >= 60 ? "Well done!" : "Good try!"}
        </h2>
        <p className="text-gray-600">{message}</p>
      </div>

      {/* Question review */}
      <div className="space-y-3 mb-8 text-left">
        {questions.map((q, i) => {
          const correct = answers[i] === q.correct;
          return (
            <div key={q.id} className="flex items-start gap-3 p-4 rounded-xl border" style={{ borderColor: correct ? "#BBF7D0" : "#FECACA", backgroundColor: correct ? "#F0FDF4" : "#FEF2F2" }}>
              <span className="font-bold text-lg shrink-0" style={{ color: correct ? "#059669" : "#DC2626" }}>
                {correct ? "✓" : "✗"}
              </span>
              <div>
                <p className="text-sm font-medium" style={{ color: "#1A1A2E" }}>{q.question}</p>
                {!correct && (
                  <p className="text-xs text-gray-500 mt-1">
                    Correct: <span className="font-semibold">{q.options[q.correct]}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onRetry}
          className="px-6 py-3 rounded-lg font-semibold text-sm border-2 transition-colors"
          style={{ borderColor: "#003399", color: "#003399" }}
        >
          Try Again
        </button>
        <Link
          href="/myths"
          className="px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
          style={{ backgroundColor: "#003399", color: "white" }}
        >
          Explore Myths & Reality →
        </Link>
      </div>
    </div>
  );
}
