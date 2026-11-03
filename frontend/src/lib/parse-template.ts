// Parse a markdown template document into outline + contents for the Studio.
// Splits on `## ` (level-2) headings. Anything before the first `##` is the cover.

export interface ParsedTemplate {
  cover: string;
  titles: string[]; // ordered section titles
  sections: string[]; // section bodies aligned with titles
}

export function parseTemplateDocument(md: string): ParsedTemplate {
  if (!md) return { cover: "", titles: [], sections: [] };
  const lines = md.split("\n");
  const titles: string[] = [];
  const sections: string[] = [];
  let cover = "";
  let current: string[] = [];
  let inSection = false;

  const flush = () => {
    if (titles.length > sections.length) sections.push(current.join("\n").trim());
  };

  for (const line of lines) {
    const m = line.match(/^##\s+(.+)$/);
    if (m) {
      if (inSection) flush();
      else cover = current.join("\n").replace(/^#\s+.+$/m, "").trim();
      titles.push(m[1].trim());
      current = [];
      inSection = true;
    } else {
      current.push(line);
    }
  }
  if (inSection) flush();
  else cover = current.join("\n").replace(/^#\s+.+$/m, "").trim();

  return { cover, titles, sections };
}

export function buildContentsFromTemplate(parsed: ParsedTemplate): {
  contents: Record<string, string>;
  customTitles: Record<string, string>;
} {
  const contents: Record<string, string> = {};
  const customTitles: Record<string, string> = {};
  if (parsed.cover) contents["cover"] = parsed.cover;
  parsed.titles.forEach((title, i) => {
    const id = String(i + 1);
    customTitles[id] = title;
    contents[id] = parsed.sections[i] || "";
  });
  return { contents, customTitles };
}
