import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak, TabStopType, TabStopPosition } from "docx";
import { saveAs } from "file-saver";
import type { OutlineNode } from "./feasibility-outline";

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*\*/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const flattenNodes = (nodes: OutlineNode[]): OutlineNode[] => {
  const result: OutlineNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children) result.push(...flattenNodes(node.children));
  }
  return result;
};

/**
 * PDF export: always uses browser print API for professional cover + TOC + Amharic support.
 */
export function exportPDF(
  projectName: string,
  outline: OutlineNode[],
  contents: Record<string, string>,
  customTitles: Record<string, string>,
  language: "en" | "am"
) {
  const nodes = flattenNodes(outline);
  const today = language === "am"
    ? new Date().toLocaleDateString("am-ET")
    : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  let html = `<!DOCTYPE html><html><head>
    <meta charset="utf-8">
    <title>${projectName}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Noto Sans Ethiopic', 'Space Grotesk', sans-serif; color: #222; line-height: 1.7; }

      .cover-page {
        height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;
        page-break-after: always; border: 3px solid #364954; margin: 20px; padding: 60px; position: relative;
      }
      .cover-page h1 { font-size: 30px; color: #364954; margin-bottom: 8px; font-weight: 700; }
      .cover-page .subtitle { font-size: 14px; letter-spacing: 3px; text-transform: uppercase; color: #FF7A1A; margin-bottom: 30px; font-family: 'IBM Plex Mono', monospace; }
      .cover-page .cover-content { font-size: 13px; color: #555; white-space: pre-wrap; margin-top: 20px; max-width: 500px; }
      .cover-page .date { font-size: 13px; color: #888; margin-top: 40px; }
      .cover-page .branding { position: absolute; bottom: 40px; font-size: 10px; color: #bbb; letter-spacing: 2px; text-transform: uppercase; }

      .toc-page { page-break-after: always; padding: 50px 40px; }
      .toc-page h2 { font-size: 22px; color: #364954; margin-bottom: 20px; border-bottom: 3px solid #FF7A1A; padding-bottom: 10px; }
      .toc-item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dotted #ccc; font-size: 13px; }
      .toc-item .num { color: #999; font-size: 11px; margin-right: 10px; font-family: 'IBM Plex Mono', monospace; }

      .section { margin-bottom: 24px; padding: 0 40px; page-break-inside: avoid; }
      .section h2 { font-size: 18px; color: #364954; border-bottom: 2px solid #FF7A1A; padding-bottom: 6px; margin-bottom: 14px; }
      .section .num { color: #999; font-size: 11px; margin-right: 6px; font-family: 'IBM Plex Mono', monospace; }
      .section p { font-size: 13px; white-space: pre-wrap; margin-bottom: 10px; text-align: justify; }

      @media print { body { padding: 0; } .cover-page { margin: 0; } }
    </style>
  </head><body>`;

  // Cover page
  html += `<div class="cover-page"><h1>${projectName}</h1>`;
  html += `<div class="subtitle">${language === "am" ? "የንግድ ሰነድ" : "Professional Document"}</div>`;
  if (contents["cover"]) html += `<div class="cover-content">${stripMarkdown(contents["cover"])}</div>`;
  html += `<div class="date">${today}</div>`;
  html += `<div class="branding">Powered by ZEBRA</div>`;
  html += `</div>`;

  // TOC
  html += `<div class="toc-page"><h2>${language === "am" ? "ማውጫ" : "Table of Contents"}</h2>`;
  for (const node of nodes) {
    if (!contents[node.id] && node.id !== "cover") continue;
    const title = customTitles[node.id] || (language === "am" && node.titleAm ? node.titleAm : node.title);
    html += `<div class="toc-item"><div><span class="num">${node.id}</span>${title}</div></div>`;
  }
  html += `</div>`;

  // Sections
  for (const node of nodes) {
    const content = stripMarkdown(contents[node.id] || "");
    if (!content && node.id !== "cover") continue;
    const title = customTitles[node.id] || (language === "am" && node.titleAm ? node.titleAm : node.title);
    html += `<div class="section"><h2><span class="num">${node.id}.</span> ${title}</h2>`;
    if (content) html += `<p>${content}</p>`;
    html += `</div>`;
  }

  html += `</body></html>`;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => { printWindow.print(); }, 800);
}

export async function exportDOCX(
  projectName: string,
  outline: OutlineNode[],
  contents: Record<string, string>,
  customTitles: Record<string, string>,
  language: "en" | "am"
) {
  const nodes = flattenNodes(outline);
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const children: Paragraph[] = [];

  // --- Cover Page ---
  children.push(new Paragraph({ spacing: { before: 3000 }, children: [] }));
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: projectName, bold: true, size: 56, font: "Arial" })],
    })
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: language === "am" ? "የንግድ ሰነድ" : "Professional Document", size: 24, color: "FF7A1A", font: "Arial" })],
    })
  );
  if (contents["cover"]) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [new TextRun({ text: stripMarkdown(contents["cover"]), size: 22, color: "666666", font: "Arial" })],
      })
    );
  }
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: today, size: 22, color: "888888", font: "Arial" })],
    })
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Powered by ZEBRA", size: 16, color: "BBBBBB", font: "Arial" })],
    })
  );
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // --- Table of Contents ---
  children.push(
    new Paragraph({
      spacing: { after: 300 },
      children: [new TextRun({ text: language === "am" ? "ማውጫ" : "Table of Contents", bold: true, size: 36, font: "Arial" })],
      border: { bottom: { style: "single" as any, size: 6, color: "FF7A1A", space: 4 } },
    })
  );
  for (const node of nodes) {
    if (!contents[node.id] && node.id !== "cover") continue;
    const title = customTitles[node.id] || (language === "am" && node.titleAm ? node.titleAm : node.title);
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({ text: `${node.id}  `, size: 18, color: "999999", font: "Arial" }),
          new TextRun({ text: title, size: 22, font: "Arial" }),
        ],
      })
    );
  }
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // --- Content Sections ---
  for (const node of nodes) {
    const title = customTitles[node.id] || (language === "am" && node.titleAm ? node.titleAm : node.title);
    const content = stripMarkdown(contents[node.id] || "");
    if (!content && node.id !== "cover") continue;

    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
        border: { bottom: { style: "single" as any, size: 4, color: "FF7A1A", space: 4 } },
        children: [
          new TextRun({ text: `${node.id}. `, size: 18, color: "999999", font: "Arial" }),
          new TextRun({ text: title, bold: true, size: 28, font: "Arial" }),
        ],
      })
    );

    if (content) {
      const paragraphs = content.split("\n\n");
      for (const p of paragraphs) {
        children.push(new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({ text: p.replace(/\n/g, " "), size: 22, font: "Arial" })],
        }));
      }
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: "Arial", size: 22 } },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children,
    }],
  });
  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, `${projectName}.docx`);
}
