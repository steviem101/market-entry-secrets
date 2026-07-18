import { test } from "node:test";
import assert from "node:assert/strict";
import { tokenizeParagraph } from "./reportRich.ts";

test("plain text passes through as a single token", () => {
  assert.deepEqual(tokenizeParagraph("Just words."), [{ type: "text", text: "Just words." }]);
});

test("bold, link and chip constructs tokenize in order", () => {
  assert.deepEqual(
    tokenizeParagraph("Valued at **USD 3.1 billion** {chip:est} per [IBISWorld](/content/ibisworld)."),
    [
      { type: "text", text: "Valued at " },
      { type: "bold", text: "USD 3.1 billion" },
      { type: "text", text: " " },
      { type: "chip", chip: "est" },
      { type: "text", text: " per " },
      { type: "link", text: "IBISWorld", url: "/content/ibisworld" },
      { type: "text", text: "." },
    ]
  );
});

test("all three chip states parse; unknown chip states stay literal text", () => {
  assert.deepEqual(tokenizeParagraph("{chip:sourced}{chip:est}{chip:inferred}"), [
    { type: "chip", chip: "sourced" },
    { type: "chip", chip: "est" },
    { type: "chip", chip: "inferred" },
  ]);
  assert.deepEqual(tokenizeParagraph("{chip:banana}"), [{ type: "text", text: "{chip:banana}" }]);
});

test("no raw-HTML construct exists — markup stays literal text", () => {
  assert.deepEqual(tokenizeParagraph("<b>nope</b> & <script>x</script>"), [
    { type: "text", text: "<b>nope</b> & <script>x</script>" },
  ]);
});

test("adjacent bold then chip (headline-number pattern R9)", () => {
  assert.deepEqual(tokenizeParagraph("**$2.2B in startup funding in 2025** {chip:sourced} —"), [
    { type: "bold", text: "$2.2B in startup funding in 2025" },
    { type: "text", text: " " },
    { type: "chip", chip: "sourced" },
    { type: "text", text: " —" },
  ]);
});

test("every Paragraph field in all three fixtures tokenizes without loss", async () => {
  const { readFile } = await import("node:fs/promises");
  for (const name of ["floats", "nory", "lemlist"]) {
    const raw = await readFile(new URL(`../fixtures/${name}.json`, import.meta.url), "utf8");
    const walk = (v: unknown): void => {
      if (typeof v === "string") {
        const roundTrip = tokenizeParagraph(v)
          .map((t) =>
            t.type === "text" ? t.text
            : t.type === "bold" ? `**${t.text}**`
            : t.type === "link" ? `[${t.text}](${t.url})`
            : `{chip:${t.chip}}`
          )
          .join("");
        assert.equal(roundTrip, v, `lossy tokenize in ${name}: ${v.slice(0, 60)}`);
      } else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object") Object.values(v).forEach(walk);
    };
    walk(JSON.parse(raw));
  }
});
