import { ReactNode, forwardRef } from "react";

interface FieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, hint, required, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className = "", ...props }, ref) {
  return (
    <input
      ref={ref}
      {...props}
      className={`w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 ${className}`}
    />
  );
});

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className = "", ...props }, ref) {
  return (
    <textarea
      ref={ref}
      {...props}
      className={`w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-y ${className}`}
    />
  );
});

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function Select({ className = "", children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white ${className}`}
    >
      {children}
    </select>
  );
}

export function CheckboxField({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
      <input type="checkbox" className="rounded border-gray-300" {...props} />
      {label}
    </label>
  );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function SaveButton({ loading, label = "Save" }: { loading: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="px-5 py-2 text-sm font-medium text-white rounded transition-opacity disabled:opacity-60"
      style={{ backgroundColor: "#003399" }}
    >
      {loading ? "Saving…" : label}
    </button>
  );
}

export function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed bottom-4 right-4 z-[300] px-4 py-3 rounded-lg text-sm shadow-lg text-white max-w-sm ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
    >
      {message}
    </div>
  );
}
