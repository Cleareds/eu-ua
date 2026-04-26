"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownContent({ content, className = "" }: { content: string; className?: string }) {
  return (
    <div className={`prose prose-gray max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-3" style={{ color: "#1A1A2E" }}>{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold mt-5 mb-2" style={{ color: "#1A1A2E" }}>{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">{children}</h3>,
          p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
          em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700">{children}</ol>,
          li: ({ children }) => <li className="text-gray-700">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 pl-4 my-4 italic text-gray-600" style={{ borderColor: "#FFD700" }}>
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a href={href} className="underline hover:opacity-70" style={{ color: "#003399" }} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          hr: () => <hr className="my-6 border-gray-200" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
