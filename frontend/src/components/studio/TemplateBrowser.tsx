import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

const templates = [
  { id: "hotel", title: "Hotel & Hospitality", sector: "Hospitality", desc: "Complete feasibility study template for hotel and resort projects." },
  { id: "manufacturing", title: "Manufacturing Plant", sector: "Manufacturing & Industry", desc: "Industrial feasibility framework covering machinery, labor, and market analysis." },
  { id: "agriculture", title: "Agriculture & Agro-processing", sector: "Agriculture", desc: "Farm-to-market business plan templates with financial projections." },
  { id: "healthcare", title: "Healthcare Facility", sector: "Health", desc: "Clinic and hospital feasibility studies with regulatory compliance." },
  { id: "education", title: "Education Center", sector: "Education / University, School & Training", desc: "School and training center business plans with enrollment forecasts." },
  { id: "realestate", title: "Real Estate Development", sector: "Construction, Engineering & Real Estate", desc: "Residential and commercial property feasibility templates." },
  { id: "tourism", title: "Tour & Travel Agency", sector: "Tour and Travel", desc: "Tourism business feasibility with market demand and route planning." },
  { id: "it", title: "IT & Software Company", sector: "Information Technology", desc: "Technology startup feasibility with TAM/SAM/SOM analysis." },
  { id: "food", title: "Food & Beverage", sector: "Food & Beverages, Café & Restaurant", desc: "Restaurant and café feasibility with location and menu analysis." },
];

interface TemplateBrowserProps {
  onSelect: (templateId: string, sector: string) => void;
  onBack: () => void;
}

const TemplateBrowser = ({ onSelect, onBack }: TemplateBrowserProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">
              <ShoppingBag className="inline h-3 w-3 mr-1" /> Marketplace
            </p>
            <h2 className="text-3xl font-display font-bold tracking-tight">
              Sector Blueprints
            </h2>
            <p className="text-muted-foreground mt-1">
              Pre-vetted feasibility study frameworks for the Ethiopian market.
            </p>
          </div>
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((t, i) => (
            <motion.div
              key={t.id}
              className="border border-border p-5 flex flex-col justify-between hover:bg-secondary/50 transition-colors"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <div>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground border border-border px-2 py-0.5 inline-block mb-3">
                  {t.sector}
                </span>
                <h3 className="font-display text-lg font-bold tracking-tight mb-1.5">
                  {t.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-5">{t.desc}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full group"
                onClick={() => onSelect(t.id, t.sector)}
              >
                Use Blueprint
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateBrowser;
