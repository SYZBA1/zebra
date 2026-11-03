import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BookOpen, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { SECTOR_CATEGORIES } from "@/lib/feasibility-outline";
import SectorManagement from "@/components/admin/knowledge/SectorManagement";
import DocumentUpload from "@/components/admin/knowledge/DocumentUpload";
import DocumentList from "@/components/admin/knowledge/DocumentList";
import TestRetrieval from "@/components/admin/knowledge/TestRetrieval";

type KnowledgeSector = {
  id: string;
  name: string;
  description?: string;
  color?: string;
};

const CATEGORY_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4"];

const PROJECT_SECTORS = SECTOR_CATEGORIES.flatMap((category, index) =>
  category.sectors.map((name) => ({
    name,
    description: `${category.label} sector from project setup`,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  })),
);

export default function KnowledgeBasePage() {
  const [sectors, setSectors] = useState<KnowledgeSector[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [syncingSectors, setSyncingSectors] = useState(false);
  const [sectorLoadFailed, setSectorLoadFailed] = useState(false);
  const [stats, setStats] = useState({ totalDocs: 0, processedDocs: 0, totalChunks: 0 });

  useEffect(() => {
    const init = async () => {
      await loadSectors();
      await loadDocuments();
      await syncProjectSectors(true);
    };
    init();
  }, []);

  const loadSectors = async () => {
    try {
      const { data, error } = await supabase
        .from("knowledge_sectors")
        .select("id, name, description, color")
        .order("name");

      if (error) throw error;
      setSectors(data || []);
      setSectorLoadFailed(false);
    } catch (error) {
      console.error("Error loading sectors:", error);
      const fallbackSectors: KnowledgeSector[] = PROJECT_SECTORS.map((sector) => ({
        id: sector.name,
        name: sector.name,
        description: sector.description,
        color: sector.color,
      }));
      setSectors(fallbackSectors);
      setSectorLoadFailed(true);
      toast.error("Failed to load sectors from DB. Using project setup sectors.");
    }
  };

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("knowledge_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const docs = data || [];
      setDocuments(docs);

      // Calculate stats
      const processed = docs.filter((d: any) => d.status === "processed").length || 0;
      const totalChunks = docs.reduce((sum: number, d: any) => sum + (d.total_chunks || 0), 0) || 0;

      setStats({
        totalDocs: docs.length || 0,
        processedDocs: processed,
        totalChunks,
      });
    } catch (error) {
      console.error("Error loading documents:", error);
      toast.error("Failed to load documents");
    }
  };

  const syncProjectSectors = async (silent = false) => {
    setSyncingSectors(true);
    try {
      const { data: existingRows, error: existingError } = await supabase
        .from("knowledge_sectors")
        .select("name");

      if (existingError) throw existingError;

      const existing = new Set((existingRows || []).map((s: any) => s.name.trim().toLowerCase()));
      const missing = PROJECT_SECTORS.filter((sector) => !existing.has(sector.name.trim().toLowerCase()));

      if (!missing.length) {
        if (!silent) toast.success("All project sectors are already imported");
        return;
      }

      const { error: insertError } = await supabase
        .from("knowledge_sectors")
        .insert(missing);

      if (insertError) throw insertError;

      if (!silent) toast.success(`Imported ${missing.length} project sectors`);
      await loadSectors();
    } catch (error) {
      console.error("Error syncing sectors:", error);
      if (!silent) {
        toast.error("Failed to import sectors to DB. You can still upload using fallback sectors.");
      }
    } finally {
      setSyncingSectors(false);
    }
  };

  const handleRefresh = () => {
    loadSectors();
    loadDocuments();
  };

  const filteredDocuments = selectedSector
    ? documents.filter((d) => d.sector_id === selectedSector)
    : documents;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Knowledge Base</h1>
            <p className="text-muted-foreground">Manage sectors and documents for RAG-based AI responses</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => syncProjectSectors(false)} disabled={syncingSectors} variant="secondary" className="gap-2">
            <UploadCloud className="w-4 h-4" />
            {syncingSectors ? "Importing..." : "Import Project Sectors"}
          </Button>
          <Button onClick={handleRefresh} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.processedDocs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Chunks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalChunks}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            All Knowledge Sectors ({sectors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sectorLoadFailed && (
            <p className="mb-2 text-xs text-amber-500">
              DB sector table is unavailable. Showing sectors from project setup.
            </p>
          )}
          {sectors.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sectors yet. Click "Import Project Sectors" to load sectors from your project setup.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sectors.map((sector) => (
                <span
                  key={sector.id}
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: sector.color || "#3B82F6" }}
                >
                  {sector.name}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="test">Test Retrieval</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentList
                documents={filteredDocuments}
                sectors={sectors}
                selectedSector={selectedSector}
                onSectorChange={setSelectedSector}
                onRefresh={loadDocuments}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Sectors</CardTitle>
            </CardHeader>
            <CardContent>
              <SectorManagement
                sectors={sectors}
                onRefresh={loadSectors}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentUpload
                sectors={sectors}
                onUploadSuccess={() => {
                  loadDocuments();
                  toast.success("Document uploaded successfully!");
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Retrieval Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <TestRetrieval sectors={sectors} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
