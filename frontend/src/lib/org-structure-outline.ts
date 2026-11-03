import type { OutlineNode } from "./feasibility-outline";

export const ORG_STRUCTURE_OUTLINE: OutlineNode[] = [
  { id: "cover", title: "Cover Page Details", titleAm: "የሽፋን ገጽ ዝርዝሮች" },
  { id: "1", title: "Executive Summary", titleAm: "ዋና ማጠቃለያ" },
  {
    id: "2", title: "Current Organizational Model", titleAm: "የአሁኑ ድርጅታዊ ሞዴል", children: [
      { id: "2.1", title: "Founder-Led Structure Analysis", titleAm: "በመስራች የሚመራ አወቃቀር ትንተና" },
      { id: "2.2", title: "Current Strengths & Gaps", titleAm: "ያሉ ጥንካሬዎች እና ክፍተቶች" },
    ]
  },
  {
    id: "3", title: "Proposed Functional Department Model", titleAm: "የቀረበ ተግባራዊ ክፍል ሞዴል", children: [
      { id: "3.1", title: "Organizational Hierarchy", titleAm: "ድርጅታዊ ተዋረድ" },
      { id: "3.2", title: "Reporting Lines", titleAm: "የሪፖርት ማቅረቢያ መስመሮች" },
      { id: "3.3", title: "Sales Department", titleAm: "የሽያጭ ክፍል" },
      { id: "3.4", title: "Operations Department", titleAm: "የኦፕሬሽን ክፍል" },
      { id: "3.5", title: "Technical Development Department", titleAm: "የቴክኒካል ልማት ክፍል" },
    ]
  },
  {
    id: "4", title: "Key Roles & Responsibilities", titleAm: "ቁልፍ ሚናዎች እና ኃላፊነቶች", children: [
      { id: "4.1", title: "C-Level & Leadership", titleAm: "ከፍተኛ አመራር" },
      { id: "4.2", title: "Department Heads", titleAm: "የክፍል ኃላፊዎች" },
      { id: "4.3", title: "Core Team Members", titleAm: "ዋና የቡድን አባላት" },
    ]
  },
  {
    id: "5", title: "Recruitment Timeline", titleAm: "የቅጥር ጊዜ ሰሌዳ", children: [
      { id: "5.1", title: "Phase 1: Immediate Hires", titleAm: "ምዕራፍ 1: አስቸኳይ ቅጥር" },
      { id: "5.2", title: "Phase 2: Growth Hires", titleAm: "ምዕራፍ 2: የዕድገት ቅጥር" },
      { id: "5.3", title: "Phase 3: Scale Hires", titleAm: "ምዕራፍ 3: የማስፋፊያ ቅጥር" },
    ]
  },
  {
    id: "6", title: "Compensation & Benefits", titleAm: "ክፍያ እና ጥቅማጥቅሞች", children: [
      { id: "6.1", title: "Salary Structure", titleAm: "የደመወዝ አወቃቀር" },
      { id: "6.2", title: "Benefits Package", titleAm: "የጥቅማጥቅም ጥቅል" },
    ]
  },
  { id: "7", title: "Training & Development Plan", titleAm: "የሥልጠና እና ልማት ዕቅድ" },
  { id: "8", title: "Conclusion", titleAm: "ማጠቃለያ" },
];
