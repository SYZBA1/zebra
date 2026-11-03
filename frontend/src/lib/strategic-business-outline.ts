import type { OutlineNode } from "./feasibility-outline";

export const STRATEGIC_BUSINESS_OUTLINE: OutlineNode[] = [
  { id: "cover", title: "Cover Page Details", titleAm: "የሽፋን ገጽ ዝርዝሮች" },
  { id: "1", title: "Executive Summary", titleAm: "ዋና ማጠቃለያ" },
  {
    id: "2", title: "Growth Engine Overview", titleAm: "የእድገት ሞተር ዳሰሳ", children: [
      { id: "2.1", title: "High-Conversion Outreach Strategy", titleAm: "ከፍተኛ ለውጥ ያለው ግንኙነት ስትራቴጂ" },
      { id: "2.2", title: "B2B Partnership Models", titleAm: "B2B የአጋርነት ሞዴሎች" },
      { id: "2.3", title: "Phased Market Entry Strategy", titleAm: "ደረጃ በደረጃ የገበያ ግቢ ስትራቴጂ" },
    ]
  },
  {
    id: "3", title: "Customer Acquisition", titleAm: "ደንበኛ ማግኘት", children: [
      { id: "3.1", title: "Customer Acquisition Cost (CAC) Targets", titleAm: "የደንበኛ ማግኘት ወጪ ዒላማዎች" },
      { id: "3.2", title: "Lead Generation Channels", titleAm: "የመሪ ማመንጫ ሰርጦች" },
      { id: "3.3", title: "Conversion Funnel Design", titleAm: "የለውጥ ፈንጠር ንድፍ" },
    ]
  },
  {
    id: "4", title: "Revenue Growth Strategy", titleAm: "የገቢ ዕድገት ስትራቴጂ", children: [
      { id: "4.1", title: "Revenue Streams", titleAm: "የገቢ ምንጮች" },
      { id: "4.2", title: "Upselling & Cross-selling", titleAm: "ተጨማሪ ሽያጭ" },
      { id: "4.3", title: "Pricing Optimization", titleAm: "የዋጋ ማመቻቸት" },
    ]
  },
  {
    id: "5", title: "Long-Term Scaling Roadmap", titleAm: "የረጅም ጊዜ ማስፋፊያ ዕቅድ", children: [
      { id: "5.1", title: "Phase 1: Foundation (0–6 months)", titleAm: "ምዕራፍ 1: መሠረት (0–6 ወራት)" },
      { id: "5.2", title: "Phase 2: Growth (6–18 months)", titleAm: "ምዕራፍ 2: ዕድገት (6–18 ወራት)" },
      { id: "5.3", title: "Phase 3: Scale (18–36 months)", titleAm: "ምዕራፍ 3: ማስፋፊያ (18–36 ወራት)" },
    ]
  },
  {
    id: "6", title: "Strategic Partnerships", titleAm: "ስትራቴጂካዊ አጋርነቶች", children: [
      { id: "6.1", title: "Partner Identification", titleAm: "አጋር ለይቶ ማወቅ" },
      { id: "6.2", title: "Partnership Terms & Models", titleAm: "የአጋርነት ውሎች" },
      { id: "6.3", title: "Joint Venture Opportunities", titleAm: "የጋራ ፕሮጀክት ዕድሎች" },
    ]
  },
  { id: "7", title: "Risk Assessment & Mitigation", titleAm: "ስጋት ግምገማ እና ቅነሳ" },
  { id: "8", title: "Conclusion & Recommendations", titleAm: "ማጠቃለያ እና ምክሮች" },
];
