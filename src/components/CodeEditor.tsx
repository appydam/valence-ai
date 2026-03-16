import { useEffect, useRef, useCallback } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";

interface CodeEditorProps {
  content: string;
  fileName: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  readOnly?: boolean;
}

function getLanguage(fileName: string) {
  if (fileName.endsWith(".md")) return markdown();
  if (fileName.endsWith(".json")) return json();
  return markdown(); // Default to markdown for unknown files
}

export function CodeEditor({ content, fileName, onChange, onSave, readOnly }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);

  // Keep refs up to date
  onChangeRef.current = onChange;
  onSaveRef.current = onSave;

  const handleSave = useCallback(() => {
    onSaveRef.current?.();
    return true;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous editor
    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    const saveKeymap = keymap.of([
      {
        key: "Mod-s",
        run: () => handleSave(),
      },
    ]);

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: content,
      extensions: [
        basicSetup,
        getLanguage(fileName),
        oneDark,
        saveKeymap,
        updateListener,
        EditorView.lineWrapping,
        EditorState.readOnly.of(readOnly ?? false),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "13px",
          },
          ".cm-scroller": {
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          },
          ".cm-gutters": {
            backgroundColor: "transparent",
            borderRight: "1px solid hsl(var(--border))",
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [fileName, readOnly, handleSave]); // Recreate editor when file changes

  // Update content when it changes externally (not from user typing)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentContent = view.state.doc.toString();
    if (currentContent !== content) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentContent.length,
          insert: content,
        },
      });
    }
  }, [content]);

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden [&_.cm-editor]:h-full" />
  );
}
