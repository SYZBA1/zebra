import { motion } from "framer-motion";
import { BadgeCheck, Star, Calendar, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Expert } from "@/lib/experts-data";

interface Props {
  expert: Expert;
  onBook?: (e: Expert) => void;
  onPortfolio?: (e: Expert) => void;
}

const ExpertCard = ({ expert, onBook, onPortfolio }: Props) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="group relative rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition-shadow"
    >
      {/* Top: Avatar + status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`relative h-14 w-14 rounded-full bg-gradient-to-br ${expert.accent} flex items-center justify-center font-display font-bold text-lg text-foreground border border-border`}>
            {expert.initials}
            {expert.online && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border-2 border-card" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-bold text-[18px] leading-tight text-foreground">{expert.name}</h3>
              {expert.verified && <BadgeCheck className="h-4 w-4 text-primary" aria-label="Zebra Verified" />}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{expert.industry}</p>
          </div>
        </div>
        <Badge variant={expert.online ? "default" : "secondary"} className="text-[10px] uppercase tracking-wider">
          {expert.online ? "Available" : "Busy"}
        </Badge>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-foreground/90 mb-3">{expert.title}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {expert.tags.slice(0, 3).map((t) => (
          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
            {t}
          </span>
        ))}
      </div>

      {/* Bio */}
      <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">{expert.bio}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="rounded-md bg-secondary/50 py-2">
          <div className="flex items-center justify-center gap-1 text-foreground font-semibold text-sm">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /> {expert.rating}
          </div>
          <div className="text-[9px] text-muted-foreground mt-0.5">{expert.appointments}+ jobs</div>
        </div>
        <div className="rounded-md bg-secondary/50 py-2">
          <div className="text-foreground font-semibold text-sm">{expert.approvalRate}%</div>
          <div className="text-[9px] text-muted-foreground mt-0.5">Approval</div>
        </div>
        <div className="rounded-md bg-secondary/50 py-2">
          <div className="text-foreground font-semibold text-sm">{expert.yearsExperience}+ yr</div>
          <div className="text-[9px] text-muted-foreground mt-0.5">Experience</div>
        </div>
      </div>

      {/* Service preview */}
      <div className="border-t border-border pt-3 mb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Primary Offering</p>
            <p className="text-sm font-medium text-foreground truncate">{expert.offering}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{expert.deliverable}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-muted-foreground">Fee</p>
            <p className="text-base font-bold text-primary">{expert.priceETB} ETB</p>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex gap-2">
        <Button size="sm" className="flex-1" onClick={() => onBook?.(expert)}>
          <Calendar className="h-3.5 w-3.5" /> Book Now
        </Button>
        <Button size="sm" variant="outline" className="flex-1" onClick={() => onPortfolio?.(expert)}>
          <Briefcase className="h-3.5 w-3.5" /> Portfolio
        </Button>
      </div>
    </motion.div>
  );
};

export default ExpertCard;
