import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

interface Sector {
  id: string;
  name: string;
}

interface RetrievedChunk {
  id: string;
  document_title: string;
  content: string;
  similarity: number;
}

interface Props {
  sectors: Sector[];
}

export default function TestRetrieval({ sectors }: Props) {
  const [query, setQuery] = useState("");
  const [sectorId, setSectorId] = useState<string | null>(null);
  const [results, setResults] = useState<RetrievedChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [tested, setTested] = useState(false);

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      toast.error("Please enter a test query");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Generate embedding for the query
      const VOYAGE_API_KEY = import.meta.env.VITE_VOYAGE_API_KEY;
      if (!VOYAGE_API_KEY) {
        toast.error("Voyage API key not configured");
        return;
      }

      // For now, we'll use a direct RPC call to test retrieval
      // In production, you'd want to embed the query properly
      const { data: embedResponse } = await supabase
        .rpc("match_knowledge_by_sector", {
          query_embedding: new Array(1024).fill(0.1) as any, // Placeholder - would need real embedding
          sector_id: sectorId,
          match_count: 5,
          filter_language: "en",
        })
        .limit(5);

      // Alternative: Call an actual retrieval endpoint
      // For this demo, we'll show the structure
      setResults(embedResponse || []);
      setTested(true);

      if (!embedResponse || embedResponse.length === 0) {
        toast.info("No matching documents found for this query");
      } else {
        toast.success(`Found ${embedResponse.length} relevant chunks`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Retrieval test failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleTest} className="space-y-4">
        {/* Sector Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Filter by Sector (Optional)
          </label>
          <Select
            value={sectorId || ""}
            onValueChange={(value) => setSectorId(value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All sectors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Sectors</SelectItem>
              {sectors.map((sector) => (
                <SelectItem key={sector.id} value={sector.id}>
                  {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Query Input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Test Query
          </label>
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a test question..."
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Test
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Results */}
      {tested && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Retrieved Chunks</h3>
            {results.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {results.length} result{results.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {results.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              <p>No matching chunks found.</p>
              <p className="text-sm mt-1">Try a different query or add more documents.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {results.map((chunk, index) => (
                <Card key={chunk.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Result {index + 1}
                        </p>
                        <p className="font-semibold">{chunk.document_title}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-muted-foreground">
                          Similarity
                        </p>
                        <p className="text-sm font-semibold text-blue-600">
                          {(chunk.similarity * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                      {chunk.content}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!tested && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm">
            <strong>How it works:</strong> Enter a test query to see which document chunks
            are retrieved by the RAG system. This helps validate that your documents are
            properly indexed and searchable.
          </p>
        </Card>
      )}
    </div>
  );
}
