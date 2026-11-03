import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Sector {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

interface Props {
  sectors: Sector[];
  onRefresh: () => void;
}

export default function SectorManagement({ sectors, onRefresh }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Sector | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [loading, setLoading] = useState(false);

  const colors = [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#8B5CF6", // Purple
    "#EC4899", // Pink
  ];

  const handleOpenDialog = (sector?: Sector) => {
    if (sector) {
      setEditing(sector);
      setName(sector.name);
      setDescription(sector.description || "");
      setColor(sector.color || "#3B82F6");
    } else {
      setEditing(null);
      setName("");
      setDescription("");
      setColor("#3B82F6");
    }
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Sector name is required");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const url = editing
        ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-knowledge-sectors/sectors/${editing.id}`
        : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-knowledge-sectors/sectors`;

      const method = editing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description, color }),
      });

      if (!response.ok) throw new Error("Failed to save sector");

      toast.success(editing ? "Sector updated!" : "Sector created!");
      setOpen(false);
      onRefresh();
    } catch (error) {
      console.error("Error:", error);
      toast.error(editing ? "Failed to update sector" : "Failed to create sector");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will not delete documents in this sector.")) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-knowledge-sectors/sectors/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete sector");

      toast.success("Sector deleted!");
      onRefresh();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete sector");
    }
  };

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Sector
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Sector" : "Create New Sector"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Healthcare, Finance, Agriculture"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    className={`w-8 h-8 rounded-full border-2 ${color === c ? "border-gray-800" : "border-gray-300"}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {sectors.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No sectors yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sectors.map((sector) => (
            <Card key={sector.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                    style={{ backgroundColor: sector.color }}
                  />
                  <div>
                    <h3 className="font-semibold">{sector.name}</h3>
                    {sector.description && (
                      <p className="text-sm text-muted-foreground">{sector.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenDialog(sector)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(sector.id)}
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
