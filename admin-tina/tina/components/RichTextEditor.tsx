import React, { useState, useRef, useEffect } from "react";
import { wrapFieldsWithMeta } from "tinacms";

/**
 * Rich Text Editor with Edit/Preview tabs.
 * Stores HTML string directly (supports colors, formatting, etc.)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RichTextEditorInner(props: any) {
  const { input } = props;
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync editor content when value changes externally
  useEffect(() => {
    if (activeTab === "edit" && editorRef.current) {
      const currentHtml = editorRef.current.innerHTML;
      const newHtml = input.value || "";
      // Only update if different to avoid cursor jumping
      if (currentHtml !== newHtml && !editorRef.current.contains(document.activeElement)) {
        editorRef.current.innerHTML = newHtml || '<p><br></p>';
      }
    }
  }, [activeTab, input.value]);

  // Initialize editor on first render
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = input.value || '<p><br></p>';
    }
  }, []);

  // Handle rich text changes - save HTML directly
  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      // Clean up empty content
      const cleaned = html === '<p><br></p>' || html === '<br>' ? '' : html;
      input.onChange(cleaned);
    }
  };

  // Toolbar actions
  const execCommand = (command: string, value?: string) => {
    // Ensure editor is focused
    if (editorRef.current) {
      editorRef.current.focus();
      
      // Make sure there's content to format
      if (editorRef.current.innerHTML === '' || editorRef.current.innerHTML === '<br>') {
        editorRef.current.innerHTML = '<p><br></p>';
        // Place cursor inside
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(editorRef.current.firstChild!, 0);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
    
    document.execCommand(command, false, value);
    
    // Trigger save
    setTimeout(() => handleInput(), 10);
  };

  const insertLink = () => {
    const url = prompt("输入链接 URL：", "https://");
    if (url) {
      execCommand("createLink", url);
    }
  };

  return (
    <div className="tina-richtext-editor border border-gray-300 rounded overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-300 bg-gray-50">
        <button
          type="button"
          onClick={() => setActiveTab("edit")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "edit"
              ? "bg-white border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          编辑
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "preview"
              ? "bg-white border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          预览
        </button>
      </div>

      {/* Rich Text Editor */}
      {activeTab === "edit" && (
        <div className="bg-white">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
            {/* Basic formatting */}
            <button
              type="button"
              onClick={() => execCommand("bold")}
              className="px-2 py-1 text-sm font-bold rounded hover:bg-gray-200"
              title="加粗 (Ctrl+B)"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => execCommand("italic")}
              className="px-2 py-1 text-sm italic rounded hover:bg-gray-200"
              title="斜体 (Ctrl+I)"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => execCommand("underline")}
              className="px-2 py-1 text-sm underline rounded hover:bg-gray-200"
              title="下划线 (Ctrl+U)"
            >
              U
            </button>
            <button
              type="button"
              onClick={() => execCommand("strikeThrough")}
              className="px-2 py-1 text-sm line-through rounded hover:bg-gray-200"
              title="删除线"
            >
              S
            </button>

            <span className="mx-1 border-l border-gray-300" />

            {/* Headers */}
            <button
              type="button"
              onClick={() => execCommand("formatBlock", "<h1>")}
              className="px-2 py-1 text-sm rounded hover:bg-gray-200"
              title="标题 1"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => execCommand("formatBlock", "<h2>")}
              className="px-2 py-1 text-sm rounded hover:bg-gray-200"
              title="标题 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => execCommand("formatBlock", "<h3>")}
              className="px-2 py-1 text-sm rounded hover:bg-gray-200"
              title="标题 3"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => execCommand("formatBlock", "<p>")}
              className="px-2 py-1 text-sm rounded hover:bg-gray-200"
              title="正文段落"
            >
              ¶
            </button>

            <span className="mx-1 border-l border-gray-300" />

            {/* Lists and structure */}
            <button
              type="button"
              onClick={() => execCommand("insertUnorderedList")}
              className="px-2 py-1 text-sm rounded hover:bg-gray-200"
              title="无序列表"
            >
              • 列表
            </button>
            <button
              type="button"
              onClick={() => execCommand("insertOrderedList")}
              className="px-2 py-1 text-sm rounded hover:bg-gray-200"
              title="有序列表"
            >
              1. 列表
            </button>
            <button
              type="button"
              onClick={() => execCommand("formatBlock", "<blockquote>")}
              className="px-2 py-1 text-sm rounded hover:bg-gray-200"
              title="引用"
            >
              " 引用
            </button>
            <button
              type="button"
              onClick={insertLink}
              className="px-2 py-1 text-sm rounded hover:bg-gray-200"
              title="插入链接"
            >
              🔗
            </button>
            <button
              type="button"
              onClick={() => execCommand("insertHorizontalRule")}
              className="px-2 py-1 text-sm rounded hover:bg-gray-200"
              title="分隔线"
            >
              ─
            </button>

            <span className="mx-1 border-l border-gray-300" />

            {/* Colors */}
            <label className="flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-gray-200 cursor-pointer" title="文字颜色">
              <span>A</span>
              <input
                type="color"
                className="w-5 h-5 border-0 p-0 cursor-pointer"
                onChange={(e) => execCommand("foreColor", e.target.value)}
              />
            </label>
            <label className="flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-gray-200 cursor-pointer" title="背景高亮">
              <span className="bg-yellow-200 px-1">A</span>
              <input
                type="color"
                defaultValue="#ffff00"
                className="w-5 h-5 border-0 p-0 cursor-pointer"
                onChange={(e) => execCommand("hiliteColor", e.target.value)}
              />
            </label>
            {/* Quick colors */}
            <div className="flex items-center gap-0.5 ml-1">
              {["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#000000"].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => execCommand("foreColor", color)}
                  className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={`颜色 ${color}`}
                />
              ))}
            </div>

            <span className="mx-1 border-l border-gray-300" />

            {/* Clear formatting */}
            <button
              type="button"
              onClick={() => execCommand("removeFormat")}
              className="px-2 py-1 text-sm rounded hover:bg-gray-200"
              title="清除格式"
            >
              ✕ 清除
            </button>
          </div>

          {/* Editable area */}
          <style>{`
            .richtext-editable h1 { font-size: 1.875rem; font-weight: bold; margin: 0.5em 0; }
            .richtext-editable h2 { font-size: 1.5rem; font-weight: bold; margin: 0.5em 0; }
            .richtext-editable h3 { font-size: 1.25rem; font-weight: bold; margin: 0.5em 0; }
            .richtext-editable p { margin: 0.5em 0; }
            .richtext-editable ul { list-style: disc; padding-left: 1.5em; margin: 0.5em 0; }
            .richtext-editable ol { list-style: decimal; padding-left: 1.5em; margin: 0.5em 0; }
            .richtext-editable li { margin: 0.25em 0; }
            .richtext-editable blockquote { border-left: 4px solid #d1d5db; padding-left: 1em; margin: 0.5em 0; color: #6b7280; font-style: italic; }
            .richtext-editable a { color: #2563eb; text-decoration: underline; }
            .richtext-editable hr { border: none; border-top: 1px solid #d1d5db; margin: 1em 0; }
          `}</style>
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="richtext-editable min-h-[250px] p-4 focus:outline-none"
            style={{ minHeight: "250px" }}
          />
        </div>
      )}

      {/* Preview */}
      {activeTab === "preview" && (
        <>
          <style>{`
            .richtext-preview h1 { font-size: 1.875rem; font-weight: bold; margin: 0.5em 0; }
            .richtext-preview h2 { font-size: 1.5rem; font-weight: bold; margin: 0.5em 0; }
            .richtext-preview h3 { font-size: 1.25rem; font-weight: bold; margin: 0.5em 0; }
            .richtext-preview p { margin: 0.5em 0; }
            .richtext-preview ul { list-style: disc; padding-left: 1.5em; margin: 0.5em 0; }
            .richtext-preview ol { list-style: decimal; padding-left: 1.5em; margin: 0.5em 0; }
            .richtext-preview li { margin: 0.25em 0; }
            .richtext-preview blockquote { border-left: 4px solid #d1d5db; padding-left: 1em; margin: 0.5em 0; color: #6b7280; font-style: italic; }
            .richtext-preview a { color: #2563eb; text-decoration: underline; }
            .richtext-preview hr { border: none; border-top: 1px solid #d1d5db; margin: 1em 0; }
          `}</style>
          <div
            className="richtext-preview p-4 min-h-[250px] bg-white"
            dangerouslySetInnerHTML={{
              __html: input.value || '<p style="color: #9ca3af;">（暂无内容）</p>',
            }}
          />
        </>
      )}
    </div>
  );
}

export const RichTextEditorField = wrapFieldsWithMeta(RichTextEditorInner);
