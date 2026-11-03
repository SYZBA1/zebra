import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Sector {
  id: string;
  name: string;
  color?: string;
}

interface Props {
  selectedSectorId?: string;
  onSectorChange: (sectorId: string | null) => void;
  className?: string;
}

export default function SectorSelector({
  selectedSectorId,
  onSectorChange,
  className,
}: Props) {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSectors();
  }, []);

  const loadSectors = async () => {
    try {
      const { data: sectorsData, error } = await supabase
        .from("knowledge_sectors")
        .select("id, name, color")
        .order("name");

      if (!error && sectorsData) {
        setSectors(sectorsData);
      }
    } catch (error) {
      console.error("Error loading sectors:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || sectors.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <Select
        value={selectedSectorId || ""}
        onValueChange={(value) => onSectorChange(value || null)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select knowledge sector..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Sectors</SelectItem>
          {sectors.map((sector) => (
            <SelectItem key={sector.id} value={sector.id}>
              <div className="flex items-center gap-2">
                {sector.color && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: sector.color }}
                  />
                )}
                {sector.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Optional: Use this component in ChatWidget for sector filtering
 * 
 * Example:
 * <SectorSelector
 *   selectedSectorId={selectedSector}
 *   onSectorChange={setSelectedSector}
 *   className="mb-3"
 * />
 * 
 * Then pass selectedSector to the backend chat API:
 * const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
 * await fetch(`${API_URL}/api/chat`, {
 *   method: "POST",
 *   headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
 *   body: JSON.stringify({ conversationId, message: text, language, sectorId: selectedSector }),
 * });
 */
