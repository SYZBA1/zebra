import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function AdminBlog() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", cover_image_url: "", published: true });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("blog_posts" as any).select("*").order("created_at", { ascending: false });
    setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title) { toast.error("Title required"); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("blog_posts" as any).insert({
      ...form,
      slug: slugify(form.title) + "-" + Date.now().toString(36),
      author_id: user?.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Post created");
    setOpen(false);
    setForm({ title: "", excerpt: "", content: "", cover_image_url: "", published: true });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("blog_posts" as any).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    load();
  };

  const togglePublish = async (id: string, published: boolean) => {
    await supabase.from("blog_posts" as any).update({ published: !published }).eq("id", id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Upload Post</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>New Blog Post</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Cover image URL</Label><Input value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} /></div>
              <div><Label>Excerpt</Label><Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
              <div><Label>Content (markdown)</Label><Textarea rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
              <div className="flex items-center justify-between"><Label>Publish immediately</Label><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /></div>
              <Button onClick={create} className="w-full">Save Post</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((p) => (
            <Card key={p.id} className="hover:border-primary/40 transition-colors overflow-hidden">
              {p.cover_image_url && <img src={p.cover_image_url} alt={p.title} className="w-full h-32 object-cover" />}
              <CardContent className="p-5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold line-clamp-2">{p.title}</h3>
                  <Badge variant={p.published ? "default" : "outline"}>{p.published ? "Live" : "Draft"}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{p.excerpt}</p>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-[10px] font-mono text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => togglePublish(p.id, p.published)}>{p.published ? "Unpublish" : "Publish"}</Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {rows.length === 0 && <p className="col-span-full text-center text-muted-foreground py-12">No posts yet.</p>}
        </div>
      )}
    </div>
  );
}
