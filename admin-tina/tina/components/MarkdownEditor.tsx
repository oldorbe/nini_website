import React, { useState, useRef, useEffect } from "react";
import { wrapFieldsWithMeta } from "tinacms";

/**
 * Custom editor with three tabs: Rich Text (contenteditable), Markdown source, Preview.
 * Stores plain markdown string.
 */
function MarkdownEditorInner(props: {
  input: { value: string; onChange: (v: string) => void };
}) {
  const { input } = props;
  const [activeTab, setActiveTab] = useState<"rich" | "markdown" | "preview">("rich");
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Simple markdown to HTML conversion
  const markdownToHtml = (md: string): string => {
    if (!md) return "";
    
    let html = md
      // Escape HTML first
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Headers
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      // Bold and italic
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 underline">$1</a>')
      // Unordered lists
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      // Paragraphs (double newlines)
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br/>");
    
    // Wrap lists
    html = html.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");
    
    return html ? `<p>${html}</p>`.replace(/<p><\/p>/g, "") : "";
  };

  // HTML to markdown conversion
  const htmlToMarkdown = (html: string): string => {
    if (!html) return "";
    
    let md = html
      // Headers
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n")
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n")
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n")
      // Bold and italic
      .replace(/<strong><em>(.*?)<\/em><\/strong>/gi, "***$1***")
      .replace(/<em><strong>(.*?)<\/strong><\/em>/gi, "***$1***")
      .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<b>(.*?)<\/b>/gi, "**$1**")
      .replace(/<em>(.*?)<\/em>/gi, "*$1*")
      .replace(/<i>(.*?)<\/i>/gi, "*$1*")
      // Links
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
      // Lists
      .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
      .replace(/<\/?ul[^>]*>/gi, "")
      .replace(/<\/?ol[^>]*>/gi, "")
      // Line breaks and paragraphs
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p><p>/gi, "\n\n")
      .replace(/<p[^>]*>/gi, "")
      .replace(/<\/p>/gi, "")
      // Divs
      .replace(/<div[^>]*>/gi, "")
      .replace(/<\/div>/gi, "\n")
      // Strip other tags
      .replace(/<[^>]+>/g, "")
      // Decode entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      // Clean up extra newlines
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    
    return md;
  };

  // Sync editor content when switching to rich text mode
  useEffect(() => {
    if (activeTab === "rich" && editorRef.current) {
      const html = markdownToHtml(input.value || "");
      if (editorRef.current.innerHTML !== html) {
        editorRef.current.innerHTML = html || '<p><br></p>';
      }
    }
  }, [activeTab, input.value]);

  // Handle rich text changes
  const handleRichTextInput = () => {
    if (editorRef.current) {
      isInternalChange.current = true;
      const md = htmlToMarkdown(editorRef.current.innerHTML);
      input.onChange(md);
    }
  };

  // Toolbar actions for rich text
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleRichTextInput();
  };

  const insertLink = () => {
    const url = prompt("输入链接 URL：", "https://");
    if (url) {
      execCommand("createLink", url);
    }
  };

  return (
    <div className="tina-markdown-editor border border-gray-300 rounded overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-300 bg-gray-50">
        <button
          type="button"
          onClick={() => setActiveTab("rich")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "rich"
              ? "bg-white border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          富文本
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("markdown")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "markdown"
              ? "bg-white border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          Markdown
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
      {activeTab === "rich" && (
        <div className="bg-white">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={() => execCommand("bold")}
              className="px-2 py-1 text-sm font-bold rounded hover:bg-gray-200"
              title="加粗"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => execCommand("italic")}
              className="px-2 py-1 text-sm italic rounded hover:bg-gray-200"
              title="斜体"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => execCommand("formatBlock", "h1")}
              className="px-2 py-1 text-sm rounded hover:bg-gray-200"
              title="标题 1"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => execCommand("formatBlock", "h2")}
              className="px-2 py-1 text-sm rounded hover:bg-gray-200"
              title="标题 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => execCommand("formatBlock", "h3")}
              className="px-2 py-1 text-sm rounded hover:bg-gray-200"
              title="标题 3"
            >
              H3
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
              onClick={() => execCommand("insertUnorderedList")}
              className="px-2 py-1 text-sm rounded hover:bg-gray-200"
              title="无序列表"
            >
              • 列表
            </button>
            <button
              type="button"
              onClick={() => execCommand("formatBlock", "p")}
              className="px-2 py-1 text-sm rounded hover:bg-gray-200"
              title="普通段落"
            >
              ¶
            </button>
            <span className="mx-1 border-l border-gray-300" />
            {/* Color picker */}
            <label className="flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-gray-200 cursor-pointer" title="文字颜色">
              <span>A</span>
              <input
                type="color"
                className="w-5 h-5 border-0 p-0 cursor-pointer"
                onChange={(e) => execCommand("foreColor", e.target.value)}
              />
            </label>
            {/* Highlight/background color */}
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
          </div>
          {/* Editable area */}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleRichTextInput}
            className="min-h-[200px] p-3 prose prose-sm max-w-none focus:outline-none"
            style={{ minHeight: "200px" }}
          />
        </div>
      )}

      {/* Markdown Editor */}
      {activeTab === "markdown" && (
        <div className="p-2">
          <textarea
            value={input.value || ""}
            onChange={(e) => input.onChange(e.target.value)}
            placeholder="输入 Markdown：&#10;**加粗** *斜体* [链接](url)&#10;# 标题&#10;- 列表项"
            className="w-full min-h-[200px] p-3 text-sm font-mono border border-gray-200 rounded resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={10}
          />
          <div className="mt-2 text-xs text-gray-500">
            语法：<code className="bg-gray-100 px-1">**加粗**</code>{" "}
            <code className="bg-gray-100 px-1">*斜体*</code>{" "}
            <code className="bg-gray-100 px-1">[链接](url)</code>{" "}
            <code className="bg-gray-100 px-1"># 标题</code>{" "}
            <code className="bg-gray-100 px-1">- 列表</code>
          </div>
        </div>
      )}

      {/* Preview */}
      {activeTab === "preview" && (
        <div
          className="p-4 min-h-[200px] prose prose-sm max-w-none bg-white"
          dangerouslySetInnerHTML={{
            __html: markdownToHtml(input.value || "") || '<p class="text-gray-400">（暂无内容）</p>',
          }}
        />
      )}
    </div>
  );
}

export const MarkdownEditorField = wrapFieldsWithMeta(MarkdownEditorInner);
