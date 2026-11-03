import type { OutlineNode } from "@/lib/feasibility-outline";
import { Check, Circle } from "lucide-react";

interface WritingProgressProps {
  outline: OutlineNode[];
  contents: Record<string, string>;
  language: "en" | "am";
  customTitles: Record<string, string>;
}

const flattenNodes = (nodes: OutlineNode[]): OutlineNode[] => {
  const result: OutlineNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children) result.push(...flattenNodes(node.children));
  }
  return result;
};

const WritingProgress = ({ outline, contents, language, customTitles }: WritingProgressProps) => {
  const leafNodes = flattenNodes(outline).filter((n) => !n.children || n.children.length === 0);
  const completed = leafNodes.filter((n) => (contents[n.id] || "").trim().length > 0).length;
  const total = leafNodes.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="px-4 py-3 border-b border-border bg-card">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          {language === "en" ? "Progress" : "ሂደት"}
        </p>
        <span className="text-xs font-mono font-bold">{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] font-mono text-muted-foreground mt-1">
        {completed}/{total} {language === "en" ? "sections" : "ክፍሎች"}
      </p>
    </div>
  );
};

export default WritingProgress;
