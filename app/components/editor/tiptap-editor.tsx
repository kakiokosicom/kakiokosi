import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect, useRef } from "react";
import { EditorToolbar } from "./editor-toolbar";

type TiptapEditorProps = {
  content: string;
  onChange?: (html: string) => void;
  /** hidden input name for form submission */
  name?: string;
};

export function TiptapEditor({ content, onChange, name = "content" }: TiptapEditorProps) {
  const hiddenRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Image.configure({ inline: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline" },
      }),
      Placeholder.configure({
        placeholder: "記事の本文を入力...",
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none min-h-[400px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      if (hiddenRef.current) hiddenRef.current.value = html;
      onChange?.(html);
    },
  });

  // Sync initial content
  useEffect(() => {
    if (hiddenRef.current) {
      hiddenRef.current.value = content;
    }
  }, [content]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("画像URLを入力:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("リンクURLを入力:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <EditorToolbar editor={editor} onAddImage={addImage} onAddLink={addLink} />
      <EditorContent editor={editor} />
      <input type="hidden" name={name} ref={hiddenRef} defaultValue={content} />
    </div>
  );
}
