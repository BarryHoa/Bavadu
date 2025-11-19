"use client";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export default function MarkdownContent({
  content,
  className = "",
}: MarkdownContentProps) {
  // Simple markdown to HTML converter
  const renderMarkdown = (md: string): string => {
    let html = md;

    // Headers - smaller font sizes
    html = html.replace(
      /^### (.*$)/gim,
      "<h3 class='text-base font-semibold mt-3 mb-1.5 text-default-800'>$1</h3>"
    );
    html = html.replace(
      /^## (.*$)/gim,
      "<h2 class='text-lg font-bold mt-4 mb-2 text-default-800'>$1</h2>"
    );
    html = html.replace(
      /^# (.*$)/gim,
      "<h1 class='text-xl font-bold mt-4 mb-2 text-default-900'>$1</h1>"
    );

    // Bold
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      "<strong class='font-semibold text-default-800'>$1</strong>"
    );

    // Lists - smaller spacing
    html = html.replace(/^- (.*$)/gim, "<li class='ml-4 text-sm'>$1</li>");
    html = html.replace(/^(\d+)\. (.*$)/gim, "<li class='ml-4 text-sm'>$2</li>");

    // Wrap consecutive list items in ul - reduced spacing
    html = html.replace(
      /(<li[^>]*>.*?<\/li>\n?)+/g,
      "<ul class='list-disc mb-2 space-y-0.5'>$&</ul>"
    );

    // Code blocks
    html = html.replace(
      /`([^`]+)`/g,
      "<code class='bg-default-100 px-1 py-0.5 rounded text-xs'>$1</code>"
    );

    // Horizontal rules - smaller margin
    html = html.replace(/^---$/gim, "<hr class='my-2 border-default-200' />");

    // Paragraphs - smaller font and spacing
    html = html
      .split("\n\n")
      .map((para) => {
        if (para.trim() && !para.match(/^<[h|u|o|l|h]/)) {
          return `<p class='mb-2 text-sm text-default-700 leading-relaxed'>${para.trim()}</p>`;
        }
        return para;
      })
      .join("\n");

    // Tables - smaller spacing
    html = html.replace(/\|(.+)\|/g, (match, content) => {
      const cells = content.split("|").map((cell: string) => cell.trim());
      if (cells.length > 1) {
        return `<div class='grid grid-cols-${cells.length} gap-1.5 py-1.5 border-b border-default-200 text-sm'>${cells.map((cell: string) => `<div class='font-medium text-default-800'>${cell}</div>`).join("")}</div>`;
      }
      return match;
    });

    return html;
  };

  return (
    <div
      className={`max-w-none ${className}`}
      dangerouslySetInnerHTML={{
        __html: renderMarkdown(content),
      }}
    />
  );
}

