export interface Question {
  id: string;
  question: string;
  hint?: string;
  placeholder?: string;
  options?: string[];
}

export const PHASE1_QUESTIONS: Question[] = [
  {
    id: "q1_sector",
    question: "What sector or industry is your business in?",
    hint: "E.g., SaaS, E-commerce, Healthcare, FinTech, etc.",
    placeholder: "Describe your business sector...",
  },
  {
    id: "q2_location",
    question: "What is your primary geographic market?",
    hint: "Where are your customers or where do you plan to operate?",
    placeholder: "E.g., North America, Europe, Global, specific countries...",
  },
  {
    id: "q3_scale",
    question: "What is the current scale of your business?",
    options: [
      "Pre-launch / Idea stage",
      "Early stage (Founder-led)",
      "Growth stage (5-50 people)",
      "Scaling stage (50+ people)",
    ],
  },
  {
    id: "q4_budget",
    question: "What is your estimated budget for this phase?",
    options: ["<50K ETB", "50K-250K ETB", "250K-1M ETB", "1M+ ETB"],
  },
  {
    id: "q5_goal",
    question: "What is your primary business goal right now?",
    hint: "E.g., Product validation, revenue generation, market expansion, fundraising, etc.",
    placeholder: "Describe your main objective...",
  },
  {
    id: "q6_timeline",
    question: "When do you want to start this initiative?",
    options: ["Immediately", "Within 1 month", "Within 3 months", "Within 6 months"],
  },
  {
    id: "q7_experience",
    question: "What is your experience level with business documentation?",
    options: [
      "First time / No experience",
      "Some experience with business plans",
      "Experienced with multiple docs",
      "Extensive experience",
    ],
  },
  {
    id: "q8_concern",
    question: "What is your main concern or challenge right now?",
    hint: "E.g., market fit, funding, team building, product development, etc.",
    placeholder: "What's your biggest challenge?",
  },
];
