import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Trash2, Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface Document {
  id: string;
  title: string;
  sector_id: string;
  file_type: string;
  file_size_bytes: number;
  status: "pending" | "processing" | "processed" | "failed";
  total_chunks: number;
  created_at: string;
  error_message?: string;
}

interface Sector {
  id: string;
  name: string;
  color?: string;
}

interface Props {
  documents: Document[];
  sectors: Sector[];
  selectedSector: string | null;
  onSectorChange: (sectorId: string | null) => void;
  onRefresh: () => void;
}

export default function DocumentList({
  documents,
  sectors,
  selectedSector,
  onSectorChange,
  onRefresh,
}: Props) {
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const getSectorName = (sectorId: string) => {
    return sectors.find((s) => s.id === sectorId)?.name || "Unknown";
  };

  const getSectorColor = (sectorId: string) => {
    return sectors.find((s) => s.id === sectorId)?.color || "#3B82F6";
  };

  const getStatusBadge = (status: string, errorMessage?: string) => {
    switch (status) {
      case "processed":
        return (
          <Badge className="bg-green-100 text-green-800 gap-1">
            <CheckCircle className="w-3 h-3" />
            Processed
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-800 gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Processing
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-gray-100 text-gray-800 gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 gap-1" title={errorMessage}>
            <AlertCircle className="w-3 h-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-knowledge-document/documents/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete document");

      toast.success("Document deleted!");
      onRefresh();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete document");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Sector Filter */}
      <div>
        <label className="text-sm font-medium">Filter by Sector</label>
        <Select
          value={selectedSector || "all"}
          onValueChange={(value) => onSectorChange(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Select sector..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            {sectors.map((sector) => (
              <SelectItem key={sector.id} value={sector.id}>
                {sector.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No documents uploaded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: getSectorColor(doc.sector_id) }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{doc.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {getSectorName(doc.sector_id)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(doc.file_size_bytes)}
                        </span>
                        {doc.total_chunks > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {doc.total_chunks} chunks
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {dateFormatter.format(new Date(doc.created_at))}
                        </span>
                      </div>
                      {doc.error_message && (
                        <p className="text-xs text-red-600 mt-1">{doc.error_message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(doc.status, doc.error_message)}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(doc.id)}
                    disabled={doc.status === "processing"}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
