export interface Question {
  id: string;
  question: string;
  questionAm?: string;
  hint?: string;
  hintAm?: string;
  placeholder?: string;
  placeholderAm?: string;
  options?: string[];
  optionsAm?: string[];
}

export const PHASE1_QUESTIONS: Question[] = [
  {
    id: "q1_sector",
    question: "What sector or industry is your business in?",
    questionAm: "ንግድዎ በየትኛው ዘርፍ ወይም ኢንደስትሪ ውስጥ ነው?",
    hint: "E.g., SaaS, E-commerce, Healthcare, FinTech, etc.",
    hintAm: "ለምሳሌ SaaS፣ የኢ-ኮሜርስ፣ ጤና፣ ፋይናንስ ቴክኖሎጂ፣ ወዘተ.",
    placeholder: "Describe your business sector...",
    placeholderAm: "የንግድዎን ዘርፍ ይግለጹ...",
  },
  {
    id: "q2_location",
    question: "What is your primary geographic market?",
    questionAm: "ዋና የገበያ ገበያዎ የት ነው?",
    hint: "Where are your customers or where do you plan to operate?",
    hintAm: "ደንበኞችዎ የት ናቸው፣ ወይም የት ማስተዳደር አቅደዋል?",
    placeholder: "E.g., North America, Europe, Global, specific countries...",
    placeholderAm: "ለምሳሌ: ሰሜን አሜሪካ፣ አውሮፓ፣ ዓለምአቀፍ፣ ወይም የተወሰኑ ሀገራት...",
  },
  {
    id: "q3_scale",
    question: "What is the current scale of your business?",
    questionAm: "የንግድዎ አሁን ያለው መጠን ምን ያህል ነው?",
    options: [
      "Pre-launch / Idea stage",
      "Early stage (Founder-led)",
      "Growth stage (5-50 people)",
      "Scaling stage (50+ people)",
    ],
    optionsAm: [
      "ከመጀመር በፊት / ሃሳብ ደረጃ",
      "መጀመሪያ ደረጃ (ከመስራች በሚመራ)",
      "የእድገት ደረጃ (5-50 ሰዎች)",
      "ማስፋፊያ ደረጃ (50+ ሰዎች)",
    ],
  },
  {
    id: "q4_budget",
    question: "What is your estimated budget for this phase?",
    questionAm: "ለዚህ ደረጃ የሚጠበቀው በጀትዎ ምን ያህል ነው?",
    options: ["<50K ETB", "50K-250K ETB", "250K-1M ETB", "1M+ ETB"],
    optionsAm: ["<50 ሺህ ብር", "50-250 ሺህ ብር", "250 ሺህ-1 ሚሊዮን ብር", "1 ሚሊዮን+ ብር"],
  },
  {
    id: "q5_goal",
    question: "What is your primary business goal right now?",
    questionAm: "አሁን ዋና የንግድ ዒላማዎ ምንድን ነው?",
    hint: "E.g., Product validation, revenue generation, market expansion, fundraising, etc.",
    hintAm: "ለምሳሌ: የምርት ማረጋገጫ፣ ገቢ ማፍራት፣ ገበያ ማስፋት፣ የገንዘብ ማሰባሰብ፣ ወዘተ.",
    placeholder: "Describe your main objective...",
    placeholderAm: "ዋና ዓላማዎን ይግለጹ...",
  },
  {
    id: "q6_timeline",
    question: "When do you want to start this initiative?",
    questionAm: "ይህን ተነሳሽነት መቼ ማስጀመር ይፈልጋሉ?",
    options: ["Immediately", "Within 1 month", "Within 3 months", "Within 6 months"],
    optionsAm: ["ወዲያውኑ", "በ1 ወር ውስጥ", "በ3 ወራት ውስጥ", "በ6 ወራት ውስጥ"],
  },
  {
    id: "q7_experience",
    question: "What is your experience level with business documentation?",
    questionAm: "ከንግድ ሰነድ ጋር ያለዎት ልምድ ምን ያህል ነው?",
    options: [
      "First time / No experience",
      "Some experience with business plans",
      "Experienced with multiple docs",
      "Extensive experience",
    ],
    optionsAm: [
      "የመጀመሪያ ጊዜ / ልምድ የለኝም",
      "ከንግድ ዕቅዶች ጋር የተወሰነ ልምድ አለኝ",
      "በብዙ ሰነዶች የተለማመድኩ",
      "ሰፊ ልምድ አለኝ",
    ],
  },
  {
    id: "q8_concern",
    question: "What is your main concern or challenge right now?",
    questionAm: "አሁን ዋና ስጋትዎ ወይም ተግዳሮትዎ ምንድን ነው?",
    hint: "E.g., market fit, funding, team building, product development, etc.",
    hintAm: "ለምሳሌ: ከገበያ ጋር መስማማት፣ የገንዘብ አቅርቦት፣ ቡድን መገንባት፣ የምርት ልማት፣ ወዘተ.",
    placeholder: "What's your biggest challenge?",
    placeholderAm: "ትልቁ ተግዳሮትዎ ምንድን ነው?",
  },
];
