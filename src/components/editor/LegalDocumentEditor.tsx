"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { autosaveLegalDocumentAction, saveNewVersionAction } from "@/lib/actions/legal-documents";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { cn } from "@/lib/utils/cn";
import type { TiptapNode } from "@/lib/editor/text-to-tiptap-doc";

const AUTOSAVE_DELAY_MS = 2500;
const WORDS_PER_PAGE = 500;

export function LegalDocumentEditor({
  documentId,
  initialContent,
}: {
  documentId: string;
  initialContent: TiptapNode;
}) {
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [versionState, setVersionState] = useState<"idle" | "saving" | "saved">("idle");
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Comece a escrever o documento..." }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "nexo-editor-content focus:outline-none",
      },
    },
    onUpdate: ({ editor: current }) => {
      scheduleAutosave(current);
    },
  });

  const scheduleAutosave = useCallback((current: Editor) => {
    setSaveState("saving");
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      const result = await autosaveLegalDocumentAction(documentId, current.getJSON());
      setSaveState(result.ok ? "saved" : "error");
    }, AUTOSAVE_DELAY_MS);
  }, [documentId]);

  useEffect(() => {
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, []);

  if (!editor) return null;

  const wordCount = editor.getText().trim().split(/\s+/).filter(Boolean).length;
  const pageEstimate = Math.max(1, Math.ceil(wordCount / WORDS_PER_PAGE));

  async function handleSaveVersion() {
    if (!editor) return;
    setVersionState("saving");
    const result = await saveNewVersionAction(documentId, editor.getJSON());
    setVersionState(result.ok ? "saved" : "idle");
    if (result.ok) setTimeout(() => setVersionState("idle"), 2000);
  }

  return (
    <div className="rounded-nexo-card border border-nexo-border bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-nexo-border px-4 py-2">
        <EditorToolbar editor={editor} />
        <div className="flex items-center gap-3 text-xs text-nexo-text-secondary">
          <span>
            {wordCount} palavras · ~{pageEstimate} página{pageEstimate > 1 ? "s" : ""}
          </span>
          <span
            className={cn(
              "font-medium",
              saveState === "saved" && "text-nexo-success",
              saveState === "saving" && "text-nexo-text-secondary",
              saveState === "error" && "text-nexo-error",
            )}
          >
            {saveState === "saved" && "Salvo"}
            {saveState === "saving" && "Salvando..."}
            {saveState === "error" && "Falha ao salvar"}
          </span>
          <button
            type="button"
            onClick={handleSaveVersion}
            disabled={versionState === "saving"}
            className="rounded-nexo-pill border border-nexo-border px-3 py-1 font-medium text-nexo-text hover:bg-nexo-panel-bg disabled:opacity-50"
          >
            {versionState === "saving" ? "Salvando versão..." : versionState === "saved" ? "Versão salva" : "Salvar versão"}
          </button>
        </div>
      </div>

      <div className="flex justify-center overflow-x-auto bg-nexo-panel-bg px-4 py-8 sm:px-8">
        <div className="w-full max-w-[794px] rounded-sm bg-white px-10 py-12 shadow-sm sm:px-16 sm:py-16">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
