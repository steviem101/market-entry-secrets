import React from 'react';
import ReactMarkdown from 'react-markdown';
import { InlineCitation } from './InlineCitation';

interface CitationRendererProps {
  content: string;
  citations: string[];
}

/**
 * Renders markdown content with inline citation markers [N] converted
 * to interactive superscript links.
 */
export const CitationRenderer = ({ content, citations }: CitationRendererProps) => {
  if (!citations || citations.length === 0) {
    // No citations — render plain markdown, [N] will show as text
    return <ReactMarkdown>{content}</ReactMarkdown>;
  }

  // Custom components override for react-markdown: we process text nodes
  // to find [N] patterns and replace them with InlineCitation components
  const components: Record<string, React.ComponentType<any>> = {
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

  return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
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
