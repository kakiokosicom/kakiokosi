import type { Editor } from "@tiptap/react";

type ToolbarProps = {
  editor: Editor;
  onAddImage: () => void;
  onAddLink: () => void;
};

function Btn({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2 py-1 text-sm rounded ${
        active
          ? "bg-gray-200 text-gray-900"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-gray-200 mx-1" />;
}

export function EditorToolbar({ editor, onAddImage, onAddLink }: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
      <Btn
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="太字"
      >
        <b>B</b>
      </Btn>
      <Btn
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="斜体"
      >
        <i>I</i>
      </Btn>
      <Btn
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="取り消し線"
      >
        <s>S</s>
      </Btn>

      <Sep />

      <Btn
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="見出し2"
      >
        H2
      </Btn>
      <Btn
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="見出し3"
      >
        H3
      </Btn>

      <Sep />

      <Btn
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="箇条書き"
      >
        &bull; List
      </Btn>
      <Btn
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="番号リスト"
      >
        1. List
      </Btn>
      <Btn
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="引用"
      >
        &ldquo; Quote
      </Btn>

      <Sep />

      <Btn onClick={onAddLink} active={editor.isActive("link")} title="リンク">
        Link
      </Btn>
      <Btn onClick={onAddImage} title="画像">
        Img
      </Btn>

      <Sep />

      <Btn
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        title="コードブロック"
      >
        {"</>"}
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="水平線"
      >
        ―
      </Btn>

      <div className="flex-1" />

      <Btn
        onClick={() => editor.chain().focus().undo().run()}
        title="元に戻す"
      >
        ↩
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().redo().run()}
        title="やり直す"
      >
        ↪
      </Btn>
    </div>
  );
}
