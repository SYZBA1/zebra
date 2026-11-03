import { useRef } from "react";
import type { OutlineNode } from "@/lib/feasibility-outline";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Printer, X } from "lucide-react";
import zebraLogo from "@/assets/zebra-logo.png";

interface PrintPreviewProps {
  projectName: string;
  sector: string;
  documentType: string;
  outline: OutlineNode[];
  contents: Record<string, string>;
  customTitles: Record<string, string>;
  language: "en" | "am";
  children: React.ReactNode;
}

const flattenNodes = (nodes: OutlineNode[]): OutlineNode[] => {
  const result: OutlineNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children) result.push(...flattenNodes(node.children));
  }
  return result;
};

const stripMarkdown = (text: string) =>
  text.replace(/\*\*\*/g, "").replace(/\*\*/g, "").replace(/\*/g, "").replace(/^#{1,6}\s+/gm, "").replace(/^[-*+]\s+/gm, "• ");

const PrintPreview = ({ projectName, sector, documentType, outline, contents, customTitles, language, children }: PrintPreviewProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const allNodes = flattenNodes(outline);
  const docLabel = documentType === "business-plan" ? "Business Plan" : "Feasibility Study";
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${projectName} - ${docLabel}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=IBM+Plex+Mono:wght@400&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Space Grotesk', sans-serif; color: #333; line-height: 1.6; }
          .cover { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; page-break-after: always; border: 2px solid #364954; margin: 20px; padding: 60px; }
          .cover img { width: 80px; margin-bottom: 40px; }
          .cover h1 { font-size: 32px; margin-bottom: 12px; color: #364954; }
          .cover .sector { font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: #FF7A1A; margin-bottom: 40px; }
          .cover .meta { font-size: 14px; color: #666; }
          .toc { page-break-after: always; padding: 40px; }
          .toc h2 { font-size: 24px; margin-bottom: 20px; color: #364954; }
          .toc-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dotted #ccc; font-size: 14px; }
          .toc-item span:first-child { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #999; margin-right: 12px; }
          .section { padding: 40px; page-break-inside: avoid; }
          .section h2 { font-size: 20px; color: #364954; border-bottom: 2px solid #FF7A1A; padding-bottom: 8px; margin-bottom: 16px; }
          .section .id { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #999; }
          .section p { margin-bottom: 12px; font-size: 14px; white-space: pre-wrap; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>${printRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  // Table of contents entries
  const tocEntries = allNodes.filter((n) => (contents[n.id] || "").trim().length > 0 || n.id === "cover");

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-3 flex flex-row items-center justify-between">
          <DialogTitle className="font-display">Print Preview</DialogTitle>
          <Button size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="h-4 w-4" /> Print / Save PDF
          </Button>
        </DialogHeader>
        <ScrollArea className="max-h-[75vh] px-6 pb-6">
          <div ref={printRef} className="bg-white text-black">
            {/* Cover Page */}
            <div className="cover" style={{ height: "auto", minHeight: "600px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", border: "2px solid #364954", margin: "0", padding: "60px", pageBreakAfter: "always" }}>
              <img src={zebraLogo} alt="Zebra" style={{ width: "80px", marginBottom: "40px" }} />
              <h1 style={{ fontSize: "32px", marginBottom: "12px", color: "#364954" }}>{projectName}</h1>
              <div style={{ fontFamily: "monospace", fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase", color: "#FF7A1A", marginBottom: "40px" }}>
                {sector} — {docLabel}
              </div>
              {contents["cover"] && (
                <div style={{ fontSize: "14px", color: "#666", whiteSpace: "pre-wrap" }}>{stripMarkdown(contents["cover"])}</div>
              )}
              <div style={{ fontSize: "14px", color: "#666", marginTop: "40px" }}>{today}</div>
            </div>

            {/* Table of Contents */}
            <div style={{ pageBreakAfter: "always", padding: "40px" }}>
              <h2 style={{ fontSize: "24px", marginBottom: "20px", color: "#364954" }}>Table of Contents</h2>
              {tocEntries.map((node) => {
                const title = customTitles[node.id] || (language === "am" && node.titleAm ? node.titleAm : node.title);
                return (
                  <div key={node.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dotted #ccc", fontSize: "14px" }}>
                    <div>
                      <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#999", marginRight: "12px" }}>{node.id}</span>
                      {title}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Content Sections */}
            {allNodes.map((node) => {
              const content = contents[node.id];
              if (!content && node.id !== "cover") return null;
              const title = customTitles[node.id] || (language === "am" && node.titleAm ? node.titleAm : node.title);
              return (
                <div key={node.id} style={{ padding: "40px", pageBreakInside: "avoid" }}>
                  <h2 style={{ fontSize: "20px", color: "#364954", borderBottom: "2px solid #FF7A1A", paddingBottom: "8px", marginBottom: "16px" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#999", marginRight: "8px" }}>{node.id}.</span>
                    {title}
                  </h2>
                  {content && <p style={{ fontSize: "14px", whiteSpace: "pre-wrap", lineHeight: "1.7" }}>{stripMarkdown(content)}</p>}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrintPreview;
