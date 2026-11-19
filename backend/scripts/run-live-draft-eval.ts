import dotenv from "dotenv";
import { buildDraftMessages } from "../src/lib/draft-prompt";

dotenv.config();

const cases = [
  {
    id: 2,
    documentType: "business-plan",
    sectionId: "4",
    sectionTitle: "Market Analysis",
    projectName: "Coffee Export Cooperative",
    sector: "Coffee production and export",
    serviceDescription: "A medium-scale member cooperative in Jimma that aggregates and exports coffee.",
    phase1Answers: { location: "Jimma", scale: "Medium scale", budget: "Not supplied" },
    language: "en",
  },
  {
    id: 4,
    documentType: "feasibility",
    sectionId: "4.1",
    sectionTitle: "Primary Product/Service",
    projectName: "Mekelle Dairy Collection and Chilling",
    sector: "Dairy",
    serviceDescription: "Dairy collection and chilling, small enterprise.",
    phase1Answers: { location: "Mekelle", scale: "Small enterprise", language: "Amharic answers" },
    language: "am",
  },
  {
    id: 5,
    documentType: "business-plan",
    sectionId: "2",
    sectionTitle: "Company Description",
    projectName: "Adama Textile Production Expansion",
    sector: "Textile production",
    serviceDescription: "Expansion of an existing textile production operation.",
    phase1Answers: { location: "Adama", employees: 25, budget: "ETB 1.5m", stage: "Expansion" },
    language: "en",
  },
  {
    id: 6,
    documentType: "feasibility",
    sectionId: "3.9",
    sectionTitle: "Operational Risks",
    projectName: "Community Pharmacy",
    sector: "Pharmacy",
    serviceDescription: "Community pharmacy in Addis Ababa; small and medium enterprise.",
    phase1Answers: { location: "Addis Ababa", scale: "SME", budget: "Unknown" },
    language: "en",
  },
  {
    id: 7,
    documentType: "business-proposal",
    sectionId: "scope",
    sectionTitle: "Scope of Work & Deliverables",
    projectName: "Dire Dawa Last-Mile Logistics",
    sector: "Transport and logistics",
    serviceDescription: "Last-mile logistics with 6 vehicles for local retailers.",
    phase1Answers: { location: "Dire Dawa", fleet: "6 vehicles", customers: "Local retailers" },
    language: "en",
  },
  {
    id: 8,
    documentType: "business-plan",
    sectionId: "6",
    sectionTitle: "Operations Plan",
    projectName: "Rural Oromia Solar Services",
    sector: "Solar energy",
    serviceDescription: "Solar installation and maintenance, medium scale.",
    phase1Answers: { location: "Rural Oromia", scale: "Medium scale", budget: "ETB 800,000" },
    language: "en",
  },
  {
    id: 9,
    documentType: "feasibility",
    sectionId: "6.1",
    sectionTitle: "Installed Capacity",
    projectName: "Lalibela Guest Lodge",
    sector: "Hospitality",
    serviceDescription: "Guest lodge at idea stage.",
    phase1Answers: { location: "Lalibela", stage: "Idea stage", budget: "Not supplied", roomCount: "Not supplied" },
    language: "en",
  },
  {
    id: 10,
    documentType: "company-profile",
    sectionId: "market",
    sectionTitle: "Target Market & Customer Segments",
    projectName: "Digital Payments Company",
    sector: "Financial technology",
    serviceDescription: "Digital payments for business-to-business merchants.",
    phase1Answers: { location: "Addis Ababa", customers: "B2B merchants" },
    language: "en",
  },
  {
    id: 12,
    documentType: "feasibility",
    sectionId: "5.1",
    sectionTitle: "Market Analysis",
    projectName: "Kenyan Avocado Exporter",
    sector: "Agriculture and export",
    serviceDescription: "Avocado exporter with Nairobi operations and EU buyers.",
    phase1Answers: { location: "Nairobi, Kenya", buyers: "European Union", budget: "Unknown" },
    language: "en",
  },
  {
    id: 13,
    documentType: "business-plan",
    sectionId: "3.1",
    sectionTitle: "Product/Service Description",
    projectName: "Bahir Dar Garment Workshop",
    sector: "Garment production",
    serviceDescription: "Garment workshop with 12 staff.",
    phase1Answers: { location: "Bahir Dar", staff: 12, projectAnswers: "Amharic" },
    language: "am",
  },
  {
    id: 14,
    documentType: "feasibility",
    sectionId: "3.1",
    sectionTitle: "Location",
    projectName: "Mixed-Language Project",
    sector: "Agriculture",
    serviceDescription: "The project answers include both Amharic and English.",
    phase1Answers: { location: "Hawassa", additionalDetails: "የፕሮጀክቱ መረጃ በአማርኛ እና English ተሰጥቷል" },
    language: "am",
  },
  {
    id: 15,
    documentType: "feasibility",
    sectionId: "10.1",
    sectionTitle: "Basic Assumptions",
    projectName: "Existing Draft Feasibility Project",
    sector: "General business",
    serviceDescription: "",
    phase1Answers: { budget: "ETB 420,000", staff: 8 },
    existingContent: "The project budget is ETB 420,000 and the team has 8 staff members.",
    language: "en",
  },
  {
    id: 17,
    documentType: "feasibility",
    sectionId: "4.1",
    sectionTitle: "Primary Product/Service",
    projectName: "Construction Project",
    sector: "Construction",
    serviceDescription: "",
    phase1Answers: { location: "Addis Ababa", service: "" },
    language: "en",
  },
  {
    id: 18,
    documentType: "business-plan",
    sectionId: "8.6",
    sectionTitle: "Funding Requirements",
    projectName: "Zero-Budget Launch Plan",
    sector: "General business",
    serviceDescription: "The user asks for a full launch plan and explicitly says the available budget is zero.",
    phase1Answers: { budget: "0", request: "Full launch plan" },
    language: "en",
  },
  {
    id: 20,
    documentType: "performance-tracking",
    sectionId: "3",
    sectionTitle: "Project Delivery Metrics",
    projectName: "Addis Digital Services",
    sector: "Information technology services",
    serviceDescription: "A small Addis Ababa team builds and maintains mobile apps for SME clients. The owner wants a performance-tracking plan. No historical KPI data or baseline values have been supplied.",
    phase1Answers: {
      location: "Addis Ababa",
      scale: "Small team",
      service: "Mobile app development and maintenance",
      customers: "SMEs",
      history: "No KPI history supplied",
      baseline: "Not supplied",
      budget: "Unknown",
      optional_1: "Blue",
      optional_2: "Prefer email",
      optional_3: "Office plants",
      optional_4: "Weekend availability",
      optional_5: "Logo color",
      optional_6: "Parking",
      optional_7: "Favorite software",
      optional_8: "Meeting snacks",
      optional_9: "Office music",
      optional_10: "Desk layout",
      optional_11: "Holiday preference",
      optional_12: "Unrelated personal note",
    },
    language: "en",
  },
];

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
const model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const selectedCases = process.env.EVAL_CASE_ID
  ? cases.filter((sample) => sample.id === Number(process.env.EVAL_CASE_ID))
  : cases;

async function main(): Promise<void> {
  if (process.env.EVAL_CASE_ID && selectedCases.length === 0) {
    throw new Error(`Unknown evaluation case: ${process.env.EVAL_CASE_ID}`);
  }

  for (const sample of selectedCases) {
    const messages = buildDraftMessages(sample);
    const systemInstruction = messages.find((message) => message.role === "system")?.content;
    const contents = messages
      .filter((message) => message.role !== "system")
      .map((message) => ({ role: "user", parts: [{ text: message.content }] }));
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents,
        }),
      }
    );
    if (!response.ok) {
      console.log(JSON.stringify({ case: sample.id, model, status: response.status, result: "ERROR" }));
      await response.body?.cancel();
      continue;
    }
    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
    console.log(JSON.stringify({ case: sample.id, model, output: text }));
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Evaluation failed";
  console.error(message);
  process.exitCode = 1;
});
