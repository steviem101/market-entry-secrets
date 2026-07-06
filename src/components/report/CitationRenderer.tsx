import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { InlineCitation } from './InlineCitation';
import { cleanUrlLabel } from '@/lib/cleanUrlLabel';

interface CitationRendererProps {
  content: string;
  citations: string[];
}

// GFM (GitHub-Flavored Markdown) unlocks tables, strikethrough, autolinks,
// and task lists for the AI's section output. Without it the `td` override
// below was dead code and any AI-emitted table rendered as raw pipe-text.
const REMARK_PLUGINS = [remarkGfm];

/**
 * Renders markdown content with inline citation markers [N] converted
 * to interactive superscript links.
 */
// Anchor override (B1): GFM autolinks a bare URL in the prose into
// <a href="url">url</a>, so the visible text is the full raw URL. When the
// link's visible label IS the raw URL, shorten it to a clean host-based label;
// genuine text labels ([Austrade](…)) pass through unchanged. Applied on both
// the citation and no-citation paths.
const LinkRenderer = ({ children, href, ...props }: any) => {
  const label =
    typeof children === 'string'
      ? cleanUrlLabel(children)
      : Array.isArray(children) && children.length === 1 && typeof children[0] === 'string'
        ? cleanUrlLabel(children[0])
        : children;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {label}
    </a>
  );
};

export const CitationRenderer = ({ content, citations }: CitationRendererProps) => {
  if (!citations || citations.length === 0) {
    // No citations — still clean any autolinked raw-URL labels ([N] shows as text)
    return (
      <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={{ a: LinkRenderer }}>
        {content}
      </ReactMarkdown>
    );
  }

  // Custom components override for react-markdown: we process text nodes
  // to find [N] patterns and replace them with InlineCitation components
  const components: Record<string, React.ComponentType<any>> = {
    a: LinkRenderer,
    p: ({ children, ...props }: any) => (
      <p {...props}>{processChildren(children, citations)}</p>
    ),
    li: ({ children, ...props }: any) => (
      <li {...props}>{processChildren(children, citations)}</li>
    ),
    td: ({ children, ...props }: any) => (
      <td {...props}>{processChildren(children, citations)}</td>
    ),
    strong: ({ children, ...props }: any) => (
      <strong {...props}>{processChildren(children, citations)}</strong>
    ),
    em: ({ children, ...props }: any) => (
      <em {...props}>{processChildren(children, citations)}</em>
    ),
  };

  return <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={components}>{content}</ReactMarkdown>;
};

const CITATION_REGEX = /\[(\d+)\]/g;

function processChildren(children: React.ReactNode, citations: string[]): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child !== 'string') return child;
    return processTextWithCitations(child, citations);
  });
}

function processTextWithCitations(text: string, citations: string[]): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(CITATION_REGEX.source, 'g');

  while ((match = regex.exec(text)) !== null) {
    const num = parseInt(match[1], 10);
    const url = citations[num - 1]; // citations array is 0-indexed, markers are 1-indexed

    // If citation number is out of range, render as plain text
    if (!url) continue;

    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    parts.push(<InlineCitation key={`cite-${match.index}`} number={num} url={url} />);
    lastIndex = match.index + match[0].length;
  }

  // If no citations found, return original text
  if (parts.length === 0) return text;

  // Add remaining text after last match
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}
