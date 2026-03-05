import { getQuizQuestions } from "@/lib/data";
import QuizClient from "@/components/quiz/QuizClient";

export const metadata = {
  title: "Quiz — EU-UA.com",
  description: "Test your knowledge of Ukraine's European identity and EU integration.",
};

export default async function QuizPage() {
  const questions = await getQuizQuestions();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <QuizClient questions={questions} />
    </div>
  );
}
