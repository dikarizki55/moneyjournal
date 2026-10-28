"use client";

interface EditorHeaderProps {
  title: string;
}

export function EditorHeader({ title }: EditorHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-new-muted-foreground/10">
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
}