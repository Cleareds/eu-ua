import { getAllQuizCategories } from "@/lib/data";
import QuizHub from "@/components/quiz/QuizHub";

export const metadata = {
  title: "Quiz — EU-UA.com",
  description: "Test your knowledge of Ukraine's European identity, history, notable people, and cultural heritage.",
};

export default async function QuizPage() {
  const categories = await getAllQuizCategories();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <QuizHub categories={categories} />
    </div>
  );
}
