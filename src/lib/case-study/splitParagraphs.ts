/**
 * Sentence-aware paragraph splitter.
 *
 * Splits prose paragraphs that exceed `maxWords` on sentence boundaries
 * (`.`, `?`, `!` followed by a space + capital letter), respecting a safelist
 * of common abbreviations so we don't break "Mr. Smith" or "U.S. market".
 *
 * Operates on the *text* inside an HTML paragraph, not on raw HTML — the
 * caller (applyEnhancements) is responsible for invoking this on text content
 * extracted from a parsed DOM, then re-emitting `<p>` blocks.
 */

const ABBREVIATIONS = new Set([
  "Mr.",
  "Mrs.",
  "Ms.",
  "Dr.",
  "Prof.",
  "Sr.",
  "Jr.",
  "St.",
  "Ave.",
  "Inc.",
  "Co.",
  "Ltd.",
  "Pty.",
  "Corp.",
  "vs.",
  "e.g.",
  "i.e.",
  "etc.",
  "U.S.",
  "U.K.",
  "U.S.A.",
  "No.",
  "Vol.",
  "Sgt.",
  "Capt.",
  "Lt.",
  "Gen.",
]);

const SENTENCE_TERMINATOR = /([.!?])\s+(?=[A-Z"'‘“(])/g;

function isAbbreviation(textBefore: string, terminator: string): boolean {
  if (terminator !== ".") return false;
  const lastWordMatch = textBefore.match(/(\S+)$/);
  if (!lastWordMatch) return false;
  return ABBREVIATIONS.has(lastWordMatch[1]);
}

export function splitIntoSentences(text: string): string[] {
  const sentences: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(SENTENCE_TERMINATOR.source, "g");

  while ((match = re.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index + 1);
    if (isAbbreviation(text.slice(lastIndex, match.index), match[1])) {
      continue;
    }
    sentences.push(before.trim());
    lastIndex = match.index + match[0].length;
  }

  const tail = text.slice(lastIndex).trim();
  if (tail) sentences.push(tail);
  return sentences;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Group sentences into paragraphs, each <= maxWords.
 *
 * Greedy: pack sentences into the current paragraph until the next sentence
 * would push it over the limit; then start a new paragraph. A single sentence
 * longer than maxWords gets its own paragraph (we don't split mid-sentence).
 */
export function groupSentencesIntoParagraphs(
  sentences: string[],
  maxWords = 80,
): string[] {
  if (sentences.length <= 1) return sentences;

  const paragraphs: string[] = [];
  let current: string[] = [];
  let currentWords = 0;

  for (const sentence of sentences) {
    const w = countWords(sentence);
    if (current.length === 0) {
      current.push(sentence);
      currentWords = w;
      continue;
    }
    if (currentWords + w > maxWords) {
      paragraphs.push(current.join(" "));
      current = [sentence];
      currentWords = w;
    } else {
      current.push(sentence);
      currentWords += w;
    }
  }
  if (current.length) paragraphs.push(current.join(" "));
  return paragraphs;
}

/**
 * Convenience: text in, array of paragraph-text out, each <= maxWords.
 */
export function splitParagraph(text: string, maxWords = 80): string[] {
  if (countWords(text) <= maxWords) return [text];
  const sentences = splitIntoSentences(text);
  return groupSentencesIntoParagraphs(sentences, maxWords);
}
