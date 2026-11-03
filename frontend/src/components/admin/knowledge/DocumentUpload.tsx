import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2, FileText, ClipboardPaste } from "lucide-react";
import { toast } from "sonner";

interface Sector { id: string; name: string; }
interface Props { sectors: Sector[]; onUploadSuccess: () => void; }

/** Split a long string into ~1200 char chunks on sentence/paragraph boundaries. */
function chunkText(text: string, maxLen = 1200): string[] {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (!clean) return [];
  if (clean.length <= maxLen) return [clean];

  const paragraphs = clean.split(/\n\s*\n+/);
  const out: string[] = [];
  let buf = "";
  for (const p of paragraphs) {
    if ((buf + "\n\n" + p).length > maxLen && buf) {
      out.push(buf.trim());
      buf = p;
    } else {
      buf = buf ? buf + "\n\n" + p : p;
    }
    while (buf.length > maxLen) {
      out.push(buf.slice(0, maxLen).trim());
      buf = buf.slice(maxLen);
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

export default function DocumentUpload({ sectors, onUploadSuccess }: Props) {
  const [sectorName, setSectorName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState<"en" | "am">("en");
  const [pastedText, setPastedText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sectorName && sectors.length) setSectorName(sectors[0].name);
  }, [sectors, sectorName]);

  const ingest = async (sourceText: string, source: string) => {
    const chunks = chunkText(sourceText);
    if (!chunks.length) throw new Error("No content to ingest.");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
    const response = await fetch(`${API_URL}/api/knowledge/ingest`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documents: [{
          title,
          source,
          sector: sectorName,
          language,
          description,
          chunks,
        }],
        replace: false,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`);
    return chunks.length;
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !sectorName || !pastedText.trim()) {
      toast.error("Title, sector and text are required.");
      return;
    }
    setLoading(true);
    try {
      const n = await ingest(pastedText, `paste:${Date.now()}`);
      toast.success(`Ingested ${n} chunk${n === 1 ? "" : "s"}. ZI now knows this.`);
      setTitle(""); setDescription(""); setPastedText("");
      onUploadSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Ingestion failed.");
    } finally { setLoading(false); }
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !sectorName || !title) {
      toast.error("Title, sector and file are required.");
      return;
    }
    setLoading(true);
    try {
      const ext = file.name.toLowerCase().split(".").pop() || "";
      const textTypes = ["txt", "md", "csv", "json"];
      let text = "";

      // 1. Upload original to private bucket for the audit trail
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated.");
      const objectPath = `${user.id}/${crypto.randomUUID()}-${file.name}`;
      await supabase.storage
        .from("knowledge-documents")
        .upload(objectPath, file, { upsert: false, contentType: file.type || "application/octet-stream" });

      // 2. Read text-based files locally and ingest
      if (textTypes.includes(ext)) {
        text = await file.text();
      } else {
        toast.warning("Binary files (PDF/DOCX) are stored but not auto-parsed. Paste their text to train ZI.");
        onUploadSuccess();
        setLoading(false);
        return;
      }
      const n = await ingest(text, `file:${file.name}`);
      toast.success(`Uploaded & ingested ${n} chunk${n === 1 ? "" : "s"}.`);
      setTitle(""); setDescription(""); setFile(null);
      onUploadSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Upload failed.");
    } finally { setLoading(false); }
  };

  const SectorPicker = (
    <div>
      <label className="block text-sm font-medium mb-2">Sector *</label>
      {sectors.length === 0 ? (
        <p className="text-sm text-muted-foreground">Create a sector first (Sectors tab).</p>
      ) : (
        <Select value={sectorName} onValueChange={setSectorName}>
          <SelectTrigger><SelectValue placeholder="Select sector…" /></SelectTrigger>
          <SelectContent>
            {sectors.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
    </div>
  );

  const Common = (
    <>
      {SectorPicker}
      <div>
        <label className="block text-sm font-medium mb-2">Title *</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Source name (e.g. NBE 2025 Investment Guide)" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional note for admins…" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Language</label>
        <Select value={language} onValueChange={(v) => setLanguage(v as "en" | "am")}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="am">አማርኛ (Amharic)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

  return (
    <Tabs defaultValue="paste" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="paste" className="gap-2"><ClipboardPaste className="w-4 h-4" />Paste Text</TabsTrigger>
        <TabsTrigger value="file" className="gap-2"><Upload className="w-4 h-4" />Upload File</TabsTrigger>
      </TabsList>

      <TabsContent value="paste">
        <form onSubmit={handlePasteSubmit} className="space-y-5 mt-4">
          {Common}
          <div>
            <label className="block text-sm font-medium mb-2">Knowledge text *</label>
            <Textarea
              rows={12}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste research notes, sector data, regulatory text, market reports…"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Stored directly in the database and embedded for ZI retrieval. {pastedText.length.toLocaleString()} chars.
            </p>
          </div>
          <Button type="submit" disabled={loading} className="w-full gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Ingesting…</> : <><ClipboardPaste className="w-4 h-4" />Ingest into ZI</>}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="file">
        <form onSubmit={handleFileSubmit} className="space-y-5 mt-4">
          {Common}
          <div>
            <label className="block text-sm font-medium mb-2">Document file *</label>
            <Input type="file" accept=".txt,.md,.csv,.json,.pdf,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <p className="text-xs text-muted-foreground mt-1">
              TXT / MD / CSV / JSON are read and embedded immediately. PDF / DOCX are stored only — paste their text to train ZI.
            </p>
            {file && (
              <p className="text-xs mt-2 flex items-center gap-1 text-muted-foreground">
                <FileText className="w-3.5 h-3.5" /> {file.name} · {(file.size / 1024).toFixed(1)} KB
              </p>
            )}
          </div>
          <Button type="submit" disabled={loading || !file} className="w-full gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading…</> : <><Upload className="w-4 h-4" />Upload &amp; Ingest</>}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
