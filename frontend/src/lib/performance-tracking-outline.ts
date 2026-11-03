import type { OutlineNode } from "./feasibility-outline";

export const PERFORMANCE_TRACKING_OUTLINE: OutlineNode[] = [
  { id: "cover", title: "Cover Page Details", titleAm: "የሽፋን ገጽ ዝርዝሮች" },
  { id: "1", title: "Executive Summary", titleAm: "ዋና ማጠቃለያ" },
  {
    id: "2", title: "KPI Framework Overview", titleAm: "የKPI ማዕቀፍ ዳሰሳ", children: [
      { id: "2.1", title: "Departmental KPIs", titleAm: "የክፍል KPIዎች" },
      { id: "2.2", title: "Individual KPIs", titleAm: "የግለሰብ KPIዎች" },
      { id: "2.3", title: "KPI Alignment with Business Goals", titleAm: "KPIዎች ከንግድ ግቦች ጋር ማስተባበር" },
    ]
  },
  {
    id: "3", title: "Project Delivery Metrics", titleAm: "የፕሮጀክት አቅርቦት መለኪያዎች", children: [
      { id: "3.1", title: "Timeline Adherence", titleAm: "የጊዜ ሰሌዳ ተገዢነት" },
      { id: "3.2", title: "Quality Benchmarks", titleAm: "የጥራት መመዘኛዎች" },
      { id: "3.3", title: "Resource Utilization", titleAm: "የሀብት አጠቃቀም" },
    ]
  },
  {
    id: "4", title: "Client Retention & Satisfaction", titleAm: "ደንበኛ ማቆየት እና እርካታ", children: [
      { id: "4.1", title: "Client Retention Rates", titleAm: "የደንበኛ ማቆየት መጠን" },
      { id: "4.2", title: "Net Promoter Score (NPS)", titleAm: "የተጣራ ፕሮሞተር ነጥብ" },
      { id: "4.3", title: "Client Feedback Loop", titleAm: "የደንበኛ ግብረመልስ ዑደት" },
    ]
  },
  {
    id: "5", title: "Sales Pipeline Velocity", titleAm: "የሽያጭ ቧንቧ ፍጥነት", children: [
      { id: "5.1", title: "Pipeline Stages & Conversion", titleAm: "የቧንቧ ደረጃዎች እና ለውጥ" },
      { id: "5.2", title: "Average Deal Size & Cycle", titleAm: "አማካይ የስምምነት መጠን እና ዑደት" },
      { id: "5.3", title: "Revenue Forecasting", titleAm: "የገቢ ትንበያ" },
    ]
  },
  {
    id: "6", title: "Review & Reporting Cadence", titleAm: "ግምገማ እና ሪፖርት ዑደት", children: [
      { id: "6.1", title: "Weekly/Monthly Reviews", titleAm: "ሳምንታዊ/ወርሃዊ ግምገማዎች" },
      { id: "6.2", title: "Quarterly Business Reviews", titleAm: "ሩብ ዓመታዊ ግምገማዎች" },
      { id: "6.3", title: "Annual Performance Assessment", titleAm: "ዓመታዊ የአፈጻጸም ግምገማ" },
    ]
  },
  { id: "7", title: "Technology & Tools", titleAm: "ቴክኖሎጂ እና መሣሪያዎች" },
  { id: "8", title: "Conclusion & Next Steps", titleAm: "ማጠቃለያ እና ቀጣይ ደረጃዎች" },
];
