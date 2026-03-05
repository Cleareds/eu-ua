import { QuizQuestion as QuizQuestionType } from "@/lib/types";

interface Props {
  question: QuizQuestionType;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onAnswer: (index: number) => void;
  onNext: () => void;
}

export default function QuizQuestion({ question, questionNumber, totalQuestions, selectedAnswer, onAnswer, onNext }: Props) {
  const answered = selectedAnswer !== null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Question {questionNumber} of {totalQuestions}</span>
          <span>{Math.round(((questionNumber - 1) / totalQuestions) * 100)}% complete</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%`, backgroundColor: "#003399" }}
          />
        </div>
      </div>

      {/* Question */}
      <h2 className="text-xl font-bold mb-8 leading-snug" style={{ color: "#1A1A2E" }}>{question.question}</h2>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {question.options.map((option, i) => {
          let style: React.CSSProperties = { borderColor: "#E5E7EB", color: "#1A1A2E", backgroundColor: "white" };
          if (answered) {
            if (i === question.correct) {
              style = { borderColor: "#059669", color: "#059669", backgroundColor: "#F0FDF4" };
            } else if (i === selectedAnswer && i !== question.correct) {
              style = { borderColor: "#DC2626", color: "#DC2626", backgroundColor: "#FEF2F2" };
            }
          } else if (i === selectedAnswer) {
            style = { borderColor: "#003399", color: "#003399", backgroundColor: "#EFF6FF" };
          }

          return (
            <button
              key={i}
              onClick={() => !answered && onAnswer(i)}
              disabled={answered}
              className="w-full text-left px-5 py-4 rounded-xl border-2 font-medium text-sm transition-all"
              style={style}
            >
              <span className="font-bold mr-3">{String.fromCharCode(65 + i)}.</span>
              {option}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {answered && (
        <div className="p-5 rounded-xl mb-8 border" style={{
          backgroundColor: selectedAnswer === question.correct ? "#F0FDF4" : "#FEF2F2",
          borderColor: selectedAnswer === question.correct ? "#BBF7D0" : "#FECACA"
        }}>
          <div className="font-semibold text-sm mb-1" style={{ color: selectedAnswer === question.correct ? "#059669" : "#DC2626" }}>
            {selectedAnswer === question.correct ? "✓ Correct!" : "✗ Not quite."}
          </div>
          <p className="text-sm text-gray-700">{question.explanation}</p>
        </div>
      )}

      {answered && (
        <button
          onClick={onNext}
          className="w-full py-4 rounded-xl font-semibold text-base transition-all hover:opacity-90"
          style={{ backgroundColor: "#003399", color: "white" }}
        >
          {questionNumber === totalQuestions ? "See Results →" : "Next Question →"}
        </button>
      )}
    </div>
  );
}
