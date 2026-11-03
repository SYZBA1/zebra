import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SECTOR_CATEGORIES, BUSINESS_SCALES, type BusinessScale } from "@/lib/feasibility-outline";
import { ArrowRight, Search, Paperclip, X, MapPin } from "lucide-react";

interface ProjectSetupProps {
  onComplete: (name: string, sector: string, serviceDescription: string, location?: string, businessScale?: string) => void;
  language?: "en" | "am";
}

const ProjectSetup = ({ onComplete, language = "en" }: ProjectSetupProps) => {
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [serviceDescription, setServiceDescription] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [businessScale, setBusinessScale] = useState<BusinessScale>("sme");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (en: string, am: string) => (language === "en" ? en : am);

  const categoriesToShow = activeCategory
    ? SECTOR_CATEGORIES.filter((c) => c.label === activeCategory)
    : SECTOR_CATEGORIES;

  const filteredCategories = categoriesToShow.map((cat) => ({
    ...cat,
    sectors: cat.sectors.filter((s) => s.toLowerCase().includes(search.toLowerCase())),
  })).filter((cat) => cat.sectors.length > 0);

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,image/*" className="hidden" onChange={handleFileAttach} />
      <div className="w-full max-w-lg space-y-6">
        <div>
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">
            {t("Phase 1", "ምዕራፍ 1")}
          </p>
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight mb-2">
            {t("Project Setup", "ፕሮጀክት ማዋቀር")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("Define your project and select the sector domain.", "የፕሮጀክት ስም ይግለጹ እና የዘርፍ ዶሜይን ይምረጡ።")}
          </p>
        </div>

        <div className="space-y-4">
          {/* Project Name */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              {t("Project Name", "የፕሮጀክት ስም")}
            </label>
            <Input
              placeholder={t("e.g. Addis Grand Hotel Feasibility Study", "ለምሳሌ የአዲስ ግራንድ ሆቴል ጥናት")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Project Location */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              <MapPin className="h-3.5 w-3.5 inline mr-1" />
              {t("Project Location", "የፕሮጀክት ቦታ")}
            </label>
            <Input
              placeholder={t("e.g. Addis Ababa, Ethiopia", "ለምሳሌ አዲስ አበባ፣ ኢትዮጵያ")}
              value={projectLocation}
              onChange={(e) => setProjectLocation(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Service Description */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              {t("Service / Product Description", "የአገልግሎት / ምርት መግለጫ")}
            </label>
            <Textarea
              placeholder={t("Briefly describe your service or product, target market, and unique value proposition...", "አገልግሎትዎን ወይም ምርትዎን፣ ዒላማ ገበያዎን እና ልዩ ዋጋዎን በአጭሩ ይግለጹ...")}
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex items-center gap-2 mt-2">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="h-3 w-3" /> {t("Attach Files", "ፋይሎችን ያያይዙ")}
              </Button>
              {attachedFiles.length > 0 && (
                <span className="text-xs text-muted-foreground">{attachedFiles.length} file(s)</span>
              )}
            </div>
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {attachedFiles.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-[10px] px-2 py-1 rounded-sm">
                    {f.name}
                    <button onClick={() => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))} className="hover:text-destructive">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Business Scale */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              {t("Business Classification", "የንግድ ምደባ")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {BUSINESS_SCALES.map((scale) => (
                <button
                  key={scale.value}
                  onClick={() => setBusinessScale(scale.value)}
                  className={`text-left text-xs px-3 py-2.5 border rounded-sm transition-colors ${
                    businessScale === scale.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-secondary text-foreground"
                  }`}
                >
                  <p className="font-bold">{language === "am" ? scale.labelAm : scale.label}</p>
                  <p className={`text-[9px] mt-0.5 ${businessScale === scale.value ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {scale.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Sector */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              {t("Sector Type", "የዘርፍ ዓይነት")}
            </label>
            <div className="flex gap-2 mb-3 flex-wrap">
              <Button variant={activeCategory === null ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(null)}>
                {t("All", "ሁሉም")}
              </Button>
              {SECTOR_CATEGORIES.map((cat) => (
                <Button
                  key={cat.label}
                  variant={activeCategory === cat.label ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat.label)}
                >
                  {language === "am" ? cat.labelAm : cat.label}
                </Button>
              ))}
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("Search sectors...", "ዘርፎችን ይፈልጉ...")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-[200px] overflow-y-auto pr-1 space-y-4">
              {filteredCategories.map((cat) => (
                <div key={cat.label}>
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                    {language === "am" ? cat.labelAm : cat.label}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.sectors.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSector(s)}
                        className={`text-left text-xs px-3 py-2 border rounded-sm transition-colors ${
                          sector === s
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:bg-secondary text-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button
          className="w-full h-11 group"
          disabled={!name.trim() || !sector}
          onClick={() => onComplete(name.trim(), sector, serviceDescription, projectLocation, businessScale)}
        >
          {t("Continue to Editor", "ወደ አርታኢ ይቀጥሉ")}
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
};

export default ProjectSetup;
