import React from "react";

type Status = "idle" | "saving" | "saved" | "error";
interface Props { status: Status; }

export default function AutoSaveBadge({ status }: Props) {
  if (status === "idle") return null;

  const config: Record<Exclude<Status, "idle">, { text: string; cls: string }> = {
    saving: { text: "Saving…",              cls: "text-gray-400" },
    saved:  { text: "Progress saved",       cls: "text-pink-500" },
    error:  { text: "Save failed — retry",  cls: "text-amber-500" },
  };

  const { text, cls } = config[status as Exclude<Status, "idle">];

  return (
    <span className={`flex items-center gap-1.5 text-xs font-medium ${cls}`}>
      {status === "saving" && (
        <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {status === "saved" && (
        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {text}
    </span>
  );
}
