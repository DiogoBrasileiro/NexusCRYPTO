"use client";

import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils/cn";

function ToolbarButton({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-8 min-w-8 items-center justify-center rounded-nexo-field px-2 text-sm font-medium transition-colors disabled:opacity-30",
        active ? "bg-nexo-black text-white" : "text-nexo-text hover:bg-nexo-panel-bg",
      )}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <ToolbarButton label="Desfazer" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        ↶
      </ToolbarButton>
      <ToolbarButton label="Refazer" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        ↷
      </ToolbarButton>

      <Divider />

      <ToolbarButton label="Título 1" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H1
      </ToolbarButton>
      <ToolbarButton label="Título 2" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H2
      </ToolbarButton>

      <Divider />

      <ToolbarButton label="Negrito" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <strong>N</strong>
      </ToolbarButton>
      <ToolbarButton label="Itálico" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton label="Sublinhado" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <span className="underline">S</span>
      </ToolbarButton>

      <Divider />

      <ToolbarButton label="Alinhar à esquerda" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
        ⟸
      </ToolbarButton>
      <ToolbarButton label="Centralizar" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
        ⟺
      </ToolbarButton>
      <ToolbarButton label="Justificar" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
        ☰
      </ToolbarButton>

      <Divider />

      <ToolbarButton label="Lista com marcadores" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        •—
      </ToolbarButton>
      <ToolbarButton label="Lista numerada" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1.
      </ToolbarButton>
      <ToolbarButton label="Citação" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        &ldquo;
      </ToolbarButton>
      <ToolbarButton label="Quebra de página" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        ⤓
      </ToolbarButton>
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-nexo-border" aria-hidden />;
}
