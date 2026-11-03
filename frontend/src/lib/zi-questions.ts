// ZI adaptive question flow — schema definitions for Company Profile and Business Proposal.

export type OptionDef = {
  value: string;
  label: string;
  labelAm: string;
  revealText?: boolean; // shows a textarea when this option is selected
};

export type FieldSpec = {
  id: string;
  label: string;
  labelAm: string;
  placeholder?: string;
  placeholderAm?: string;
  multiLine?: boolean;
  inputType?: "text" | "email" | "tel";
};

export type QuestionInput =
  | { type: "text"; placeholder?: string; placeholderAm?: string }
  | { type: "textarea"; placeholder?: string; placeholderAm?: string }
  | { type: "two-fields"; field1: FieldSpec; field2: FieldSpec }
  | { type: "single-select"; options: OptionDef[]; followUp?: FieldSpec }
  | { type: "multi-select"; options: OptionDef[] }
  | { type: "dynamic-list"; maxItems: number; namePlaceholder: string; namePlaceholderAm: string; descPlaceholder: string; descPlaceholderAm: string }
  | { type: "multi-field"; fields: FieldSpec[] };

export type QuestionDef = {
  id: string;
  stripeNumber: number;
  question: string;
  questionAm: string;
  hint: string;
  hintAm: string;
  input: QuestionInput;
  isFinal?: boolean;
};

// ─── COMPANY PROFILE ─────────────────────────────────────────────────────────

export const COMPANY_PROFILE_QUESTIONS: QuestionDef[] = [
  {
    id: "identity",
    stripeNumber: 1,
    question: "What is your company's official registered name, and what does it do in one sentence?",
    questionAm: "የድርጅትዎ ኦፊሴላዊ ስም ምንድን ነው፣ እና በአንድ ዓረፍተ ነገር ምን ያደርጋል?",
    hint: "This becomes your cover page headline and the opening line of your executive summary.",
    hintAm: "ይህ የሽፋን ገጽዎ ርዕስ እና ዋና ማጠቃለያዎ የመጀመሪያ ሐሳብ ይሆናል።",
    input: {
      type: "two-fields",
      field1: { id: "companyName", label: "Company Name", labelAm: "የድርጅት ስም", placeholder: "e.g. Habesha Consulting PLC", placeholderAm: "ለምሳሌ: ሃበሻ ኮንሳልቲንግ ኃ.የ.ግ." },
      field2: { id: "oneLiner", label: "What it does — one sentence", labelAm: "ምን እንደሚያደርግ — አንድ ዓረፍተ ነገር", placeholder: "e.g. We help Ethiopian SMEs access finance through bank-ready feasibility studies.", placeholderAm: "ለምሳሌ: ለኢትዮጵያ ጥቃቅን ድርጅቶች ቀልጣፋ የፋይናንስ ሰነዶች እንሰጣለን።", multiLine: true },
    },
  },
  {
    id: "story",
    stripeNumber: 2,
    question: "When was your company founded, where is it based, and what was the original motivation for starting it?",
    questionAm: "ድርጅትዎ መቼ ተቋቋመ፣ ቢሮው የት ነው፣ እና ለምን ተጀመረ?",
    hint: "Your founding story makes investors and clients trust you. Even a simple honest reason is powerful.",
    hintAm: "የድርጅትዎ መጀመሪያ ታሪክ ሐቀኝነት ያሳያል — ይህ ተሳታፊዎን ያምናል።",
    input: {
      type: "textarea",
      placeholder: "e.g. Founded in 2019 in Addis Ababa. We started because we saw that many Ethiopian entrepreneurs had viable ideas but couldn't produce the documents banks required.",
      placeholderAm: "ለምሳሌ: በ2019 አዲስ አበባ ተቋቋምን። ብዙ ሥራ ፈጣሪዎች ጥሩ ሃሳብ ቢኖራቸውም ባንኮቹ የሚጠይቁትን ሰነዶች ማዘጋጀት ስላልቻሉ ጀምረናል።",
    },
  },
  {
    id: "mission",
    stripeNumber: 3,
    question: "Complete these two sentences:\nOur mission is to [what we do for who].\nOur vision is to [what the world looks like if we succeed].",
    questionAm: "እነዚህን ሁለት ዓረፍተ ነገሮች ይሙሉ:\nተልዕኳችን [ለማን ምን ማድረግ ነው].\nራዕያችን [ብናሳካ ዓለም እንዴት ትሆናለች].",
    hint: "Mission is present tense — what you do today. Vision is future tense — where you are going.",
    hintAm: "ተልዕኮ አሁን ያለ ጊዜ ነው። ራዕይ ወደፊት ያለ ጊዜ ነው።",
    input: {
      type: "single-select",
      options: [
        { value: "write-own", label: "I will type my own mission and vision", labelAm: "የራሴን ተልዕኮ እና ራዕይ እጽፋለሁ", revealText: true },
        { value: "help-me", label: "Help me write it based on my business type", labelAm: "እንደ ንግድ ዓይነቴ ይፃፉልኝ" },
      ],
      followUp: { id: "missionVisionText", label: "Your mission and vision", labelAm: "ተልዕኮዎ እና ራዕይዎ", placeholder: "Mission: We exist to...\n\nVision: A future where...", placeholderAm: "ተልዕኮ: እኛ ለ...\n\nራዕይ: የወደፊት ዓለም...", multiLine: true },
    },
  },
  {
    id: "products",
    stripeNumber: 4,
    question: "List your main products or services. For each one, give a name and one sentence description.",
    questionAm: "ዋና ምርቶችዎን ወይም አገልግሎቶችዎን ዘርዝሩ። ለእያንዳንዱ ስምና አጭር መግለጫ ይስጡ።",
    hint: "Be specific. Not 'consulting services' but 'financial feasibility studies for Ethiopian SMEs starting at ETB 3,500 per study.'",
    hintAm: "ግልፅ ሁኑ። 'የምክር አገልግሎት' ሳይሆን 'ለኢትዮጵያ SMEዎች የፋይናንስ ጥናት ከ3,500 ብር ጀምሮ'።",
    input: {
      type: "dynamic-list",
      maxItems: 8,
      namePlaceholder: "Service or product name",
      namePlaceholderAm: "የአገልግሎት ወይም ምርት ስም",
      descPlaceholder: "One sentence: what it is, who it's for, and price if known.",
      descPlaceholderAm: "አንድ ዓረፍተ ነገር: ምን እንደሆነ፣ ለማን እንደሆነ፣ ዋጋው።",
    },
  },
  {
    id: "market",
    stripeNumber: 5,
    question: "Who is your ideal customer? Describe them as specifically as possible.",
    questionAm: "ሃሳባዊ ደንበኛዎ ማን ነው? በተቻለ መጠን ዝርዝር ያብራሩ።",
    hint: "Think about their job title, location, business size, and what problem they have that you solve better than anyone else.",
    hintAm: "የሥራ ማዕረጋቸውን፣ ቦታቸውን፣ የንግድ መጠናቸውን፣ እና ችግራቸውን ያስቡ።",
    input: {
      type: "multi-select",
      options: [
        { value: "sme", label: "Small and medium enterprises (SMEs)", labelAm: "ጥቃቅን እና አነስተኛ ድርጅቶች (SMEዎች)" },
        { value: "startup", label: "Individual entrepreneurs and startups", labelAm: "ግለሰብ ሥራ ፈጣሪዎች እና ጀማሪ ድርጅቶች" },
        { value: "government", label: "Government and public institutions", labelAm: "መንግሥት እና የሕዝብ ተቋማት" },
        { value: "ngo", label: "NGOs and development organisations", labelAm: "ኤንጂኦዎች እና ልማት ድርጅቶች" },
        { value: "banks", label: "Banks and financial institutions", labelAm: "ባንኮች እና የፋይናንስ ተቋማት" },
        { value: "diaspora", label: "International investors and diaspora", labelAm: "አለምአቀፍ ባለሃብቶች እና ዳያስፖራ" },
      ],
    },
  },
  {
    id: "team",
    stripeNumber: 6,
    question: "Who leads the company? Name, role, and one key qualification for each leader.",
    questionAm: "ድርጅቱን የሚመሩት እነማን ናቸው? ስም፣ ሚና፣ እና አንድ ዋና ብቃት ለእያንዳንዳቸው።",
    hint: "Investors and clients trust companies with clearly identified, credible people behind them. If you are a solo founder, say so confidently.",
    hintAm: "ባለሃብቶች እና ደንበኞች ግልፅ ሰዎች ያሏቸውን ድርጅቶች ያምናሉ። ብቸኛ መስራች ከሆኑ ያንን በድፍረት ይናገሩ።",
    input: {
      type: "dynamic-list",
      maxItems: 5,
      namePlaceholder: "Full name and role (e.g. Meron Tadesse — CEO)",
      namePlaceholderAm: "ሙሉ ስም እና ሚና (ለምሳሌ: ሜሮን ታደሰ — ዋና ሥራ አስፈፃሚ)",
      descPlaceholder: "One key qualification (e.g. MBA from AAU, 12 years in agri-finance)",
      descPlaceholderAm: "አንድ ዋና ብቃት (ለምሳሌ: ከAAAU MBA፣ 12 ዓመት በ agri-finance)",
    },
  },
  {
    id: "proof",
    stripeNumber: 7,
    question: "Do you have any client success stories, awards, certifications, or partnerships you can mention?",
    questionAm: "የደንበኛ ስኬት ታሪኮች፣ ሽልማቶች፣ ምስክር ወረቀቶች ወይም አጋርነቶች አሉዎት?",
    hint: "Even one real example — a client who benefited, a licence obtained, a partnership formed — adds more credibility than any claim.",
    hintAm: "አንድ እውነተኛ ምሳሌ — ተጠቃሚ ደንበኛ፣ ፈቃድ፣ ወይም አጋርነት — ከምንም ቃል አስተማማኝ ነው።",
    input: {
      type: "single-select",
      options: [
        { value: "yes-stories", label: "Yes — I will describe them", labelAm: "አዎ — ልግለጻቸው", revealText: true },
        { value: "certifications", label: "I have certifications or licences", labelAm: "ምስክር ወረቀቶች ወይም ፈቃዶች አሉኝ", revealText: true },
        { value: "none", label: "Not yet — I am pre-revenue or newly launched", labelAm: "እስካሁን አይደለም — አዲስ ነኝ ወይም ገቢ ገና የለኝም" },
      ],
      followUp: { id: "proofText", label: "Describe your achievements", labelAm: "ስኬቶችዎን ይግለጹ", placeholder: "e.g. Helped 3 SMEs secure ETB 5M in bank loans. ISO 9001 certified. Partnership with Chamber of Commerce.", placeholderAm: "ለምሳሌ: 3 SMEዎች ETB 5 ሚሊዮን ብድር እንዲያገኙ ረድተናል።", multiLine: true },
    },
  },
  {
    id: "differentiator",
    stripeNumber: 8,
    question: "In one sentence, complete this: Unlike our competitors, we are the only company that…",
    questionAm: "በአንድ ዓረፍተ ነገር ይሙሉ: ከተወዳዳሪዎቻችን ለየት ሲባል፣ እኛ ብቻ ነን...",
    hint: "This becomes your single most powerful selling line. Do not say 'we provide quality service.' Say what no one else does.",
    hintAm: "ይህ ዋነኛ የሽያጭ ዓረፍተ ነገርዎ ይሆናል። 'ጥሩ አገልግሎት' አይበሉ — ሌላ ማንም የማያደርገውን ይናገሩ።",
    input: {
      type: "text",
      placeholder: "e.g. …combine financial document expertise with Amharic-language consulting specifically for Ethiopian bank requirements.",
      placeholderAm: "ለምሳሌ: …የፋይናንስ ሰነድ ብቃትን ከኢትዮጵያ ባንክ ፍላጎቶች ጋር በአማርኛ ቋንቋ እናቀናጃለን።",
    },
  },
  {
    id: "audience",
    stripeNumber: 9,
    question: "Who will read this company profile?",
    questionAm: "ይህ የድርጅት መገለጫ ለማን ይሆናል?",
    hint: "The tone and call to action will be adjusted to speak directly to this audience.",
    hintAm: "ቃናው እና ጥሪ ወደ እርምጃ ለዚህ ተደራሲ ቀጥታ እንዲናገር ይስተካከላል።",
    input: {
      type: "single-select",
      options: [
        { value: "investors", label: "Potential investors or funding partners", labelAm: "ሊሆኑ ባለሃብቶች ወይም የፋይናንስ አጋሮች" },
        { value: "bank", label: "Bank or financial institution", labelAm: "ባንክ ወይም የፋይናንስ ተቋም" },
        { value: "corporate", label: "Corporate clients and business partners", labelAm: "ኩባንያ ደንበኞች እና የንግድ አጋሮች" },
        { value: "government", label: "Government or procurement authority", labelAm: "መንግሥት ወይም የግዥ ባለሥልጣን" },
        { value: "public", label: "General public and new customers", labelAm: "ሕዝቡ እና አዲስ ደንበኞች" },
      ],
    },
  },
  {
    id: "contact",
    stripeNumber: 10,
    question: "What are your official contact details and do you have a logo or brand colour to mention?",
    questionAm: "ኦፊሴላዊ የዕውቂያ መረጃዎ ምንድን ነው፣ እና አርማ ወይም የብራንድ ቀለም አለዎት?",
    hint: "These appear on the cover page and the final contact section.",
    hintAm: "እነዚህ በሽፋን ገጹ እና የመጨረሻ ዕውቂያ ክፍሉ ላይ ይታያሉ።",
    input: {
      type: "multi-field",
      fields: [
        { id: "website",    label: "Website",      labelAm: "ድረ-ገጽ",       placeholder: "www.yourcompany.com" },
        { id: "email",      label: "Email",        labelAm: "ኢሜይል",         placeholder: "info@yourcompany.com",   inputType: "email" },
        { id: "phone",      label: "Phone",        labelAm: "ስልክ",           placeholder: "+251 9XX XXX XXX",       inputType: "tel" },
        { id: "location",   label: "Address",      labelAm: "አድራሻ",         placeholder: "e.g. Bole, Addis Ababa, Ethiopia" },
        { id: "brandColor", label: "Brand colour (optional)", labelAm: "የብራንድ ቀለም (አማራጭ)", placeholder: "e.g. Deep green and gold" },
      ],
    },
    isFinal: true,
  },
];

// ─── BUSINESS PROPOSAL ───────────────────────────────────────────────────────

export const BUSINESS_PROPOSAL_QUESTIONS: QuestionDef[] = [
  {
    id: "recipient",
    stripeNumber: 1,
    question: "Who are you sending this proposal to? Name the organisation, person, or type of audience.",
    questionAm: "ይህን ሃሳብ ለማን እየላኩ ነው? ድርጅቱን፣ ሰውን ወይም የተደራሲ ዓይነትን ይጥቀሱ።",
    hint: "The proposal is addressed to them specifically. Their name on the cover creates immediate personal relevance.",
    hintAm: "ሃሳቡ ቀጥታ ለእነሱ የቀረበ ነው። ስማቸው በሽፋን ገጹ ላይ ቀጥተኛ ጠቀሜታ ይፈጥራል።",
    input: {
      type: "two-fields",
      field1: { id: "recipientName", label: "Recipient name", labelAm: "የተቀባዩ ስም", placeholder: "e.g. Ato Kebede Alemu", placeholderAm: "ለምሳሌ: አቶ ከበደ አለሙ" },
      field2: { id: "recipientOrg", label: "Organisation", labelAm: "ድርጅት", placeholder: "e.g. Oromia Cooperative Bank", placeholderAm: "ለምሳሌ: ኦሮሚያ ኅብረት ሥራ ባንክ" },
    },
  },
  {
    id: "problem",
    stripeNumber: 2,
    question: "What problem does your client have, or what opportunity are you proposing they act on?",
    questionAm: "ደንበኛዎ ምን ችግር አለበት፣ ወይም ምን ዕድል ለምን ፈጥነው ሊጠቀሙበት ይገባቸዋል?",
    hint: "Start with their situation, not yours. The strongest proposals open with the client's pain, not the seller's pitch.",
    hintAm: "ከደንበኛዎ ሁኔታ ጀምሩ። ጠንካራ ሃሳቦች ከደንበኛው ችግር ይጀምራሉ — ከሻጩ ቅስቀሳ አይደለም።",
    input: {
      type: "textarea",
      placeholder: "e.g. Oromia Cooperative Bank has a backlog of SME loan applications that require feasibility studies, but applicants lack the capacity to produce bank-grade documents.",
      placeholderAm: "ለምሳሌ: ኦሮሚያ ባንክ SME ብድር ጥያቄዎች አሉት ግን አመልካቾቹ የጥናት ሰነዶችን ማዘጋጀት አይችሉም።",
    },
  },
  {
    id: "solution",
    stripeNumber: 3,
    question: "What exactly are you offering to do for them? Describe the solution in plain, specific terms.",
    questionAm: "ለእነሱ ምን ትክክለኛ ነገር ለማድረግ ነው? መፍትሔውን ግልፅ፣ ዝርዝር ቋንቋ ይጠቀሙ።",
    hint: "Be concrete. Not 'provide consulting services' but 'conduct a full market feasibility study for your new product line, delivered within 14 days as a bank-ready PDF report.'",
    hintAm: "ግልፅ ሁኑ። 'የምክር አገልግሎት' ሳይሆን '14 ቀን ውስጥ ለባንክ ዝግጁ PDF ሪፖርት ሆኖ የሚቀርብ የሙሉ ገበያ ጥናት'።",
    input: {
      type: "textarea",
      placeholder: "e.g. We will prepare full bank-ready feasibility studies for up to 10 SME applicants per month, each delivered as a branded PDF within 7 business days.",
      placeholderAm: "ለምሳሌ: እስከ 10 SME አመልካቾች ለወር ሙሉ የባንክ ዝግጁ የጥናት ሰነድ እናዘጋጃለን።",
    },
  },
  {
    id: "deliverables",
    stripeNumber: 4,
    question: "List the specific deliverables the client will receive when they accept this proposal.",
    questionAm: "ደንበኛዎ ሃሳቡን ሲቀበሉ የሚያገኙትን ዝርዝር ውጤቶች ዘርዝሩ።",
    hint: "Deliverables are the tangible outputs — documents, services, sessions, reports. The more specific, the more trust you build.",
    hintAm: "ውጤቶቹ ሊዳሰሱ የሚችሉ ናቸው — ሰነዶች፣ አገልግሎቶች፣ ስብሰባዎች። ዝርዝር ሲሆን አስተማማኝነት ይጨምራል።",
    input: {
      type: "dynamic-list",
      maxItems: 8,
      namePlaceholder: "Deliverable name (e.g. Feasibility Study Report)",
      namePlaceholderAm: "የውጤት ስም (ለምሳሌ: የጥናት ሪፖርት)",
      descPlaceholder: "What exactly this includes and the format it will be in.",
      descPlaceholderAm: "ምን እንደሚይዝ እና ቅርጸቱ ምን እንደሆነ።",
    },
  },
  {
    id: "timeline",
    stripeNumber: 5,
    question: "How long will this take, and what are the key milestones?",
    questionAm: "ምን ያህል ጊዜ ይወስዳል፣ ዋና ዋና ምዕራፎቹ ምን ምን ናቸው?",
    hint: "Even a rough timeline shows the client you have thought this through. Use phases if the work is complex.",
    hintAm: "ትንሽ ጊዜ ሰሌዳ እንኳን ሥራቅ ጠጋኝ ነበርክ ለደንበኛው ያሳያል።",
    input: {
      type: "single-select",
      options: [
        { value: "less-1w", label: "Less than 1 week", labelAm: "ከ1 ሳምንት ባነሰ" },
        { value: "1-2w", label: "1–2 weeks", labelAm: "1–2 ሳምንት" },
        { value: "2-4w", label: "2–4 weeks", labelAm: "2–4 ሳምንት" },
        { value: "1-3m", label: "1–3 months", labelAm: "1–3 ወር" },
        { value: "3-6m", label: "3–6 months", labelAm: "3–6 ወር" },
        { value: "6m+", label: "More than 6 months", labelAm: "ከ6 ወር በላይ" },
        { value: "custom", label: "Let me describe the phases", labelAm: "ምዕራፎቹን ልግለጽ", revealText: true },
      ],
      followUp: { id: "timelineDetail", label: "Describe the phases and milestones", labelAm: "ምዕራፎቹን እና ምልክቶቹን ይግለጹ", placeholder: "Phase 1 (Days 1–3): Discovery and data gathering.\nPhase 2 (Days 4–10): Analysis and drafting.\nPhase 3 (Day 14): Final delivery.", placeholderAm: "ምዕራፍ 1 (ቀን 1–3): መረጃ ማሰባሰብ።\nምዕራፍ 2 (ቀን 4–10): ትንተና እና ረቂቅ።\nምዕራፍ 3 (ቀን 14): ማጠናቀቂያ ሰጥቶ።", multiLine: true },
    },
  },
  {
    id: "pricing",
    stripeNumber: 6,
    question: "What is the total cost, and how is it structured?",
    questionAm: "ጠቅላላ ወጪው ምን ያህል ነው፣ እና እንዴት ተደራጅቷል?",
    hint: "Show how the price is broken down. A clear price table removes the biggest barrier to proposal acceptance — uncertainty about cost.",
    hintAm: "ዋጋው እንዴት እንደተበታተነ ያሳዩ። ግልፅ ዋጋ ሠንጠረዥ ሃሳቡ ሊቀበሉበት ዋናው እንቅፋት ስጋትን ያስወግዳል።",
    input: {
      type: "single-select",
      options: [
        { value: "fixed", label: "Fixed total price (enter amount in ETB)", labelAm: "ቋሚ ጠቅላላ ዋጋ (ብር መጠን ያስገቡ)", revealText: true },
        { value: "per-item", label: "Per deliverable pricing (I will list each price)", labelAm: "ለእያንዳንዱ ውጤት ዋጋ (ዋጋዎቹን ዘርዝራለሁ)", revealText: true },
        { value: "retainer", label: "Retainer or monthly fee (enter monthly amount)", labelAm: "ወርሃዊ ክፍያ (ወርሃዊ መጠን ያስገቡ)", revealText: true },
        { value: "tbd", label: "To be discussed after this proposal", labelAm: "ከዚህ ሃሳብ በኋላ ይወሰናል" },
      ],
      followUp: { id: "pricingDetail", label: "Price details", labelAm: "ዋጋ ዝርዝር", placeholder: "e.g. Fixed total: ETB 45,000 — covers all 10 feasibility studies. Payment: 50% upfront, 50% on delivery.", placeholderAm: "ለምሳሌ: ቋሚ ጠቅላላ: 45,000 ብር — ሁሉ 10 ጥናቶችን ይሸፍናል።", multiLine: true },
    },
  },
  {
    id: "why-us",
    stripeNumber: 7,
    question: "What makes you or your company the right choice for this specific opportunity?",
    questionAm: "ለዚህ ልዩ ዕድል እርስዎ ወይም ድርጅትዎ ትክክለኛ ምርጫ የሚያደርገው ምንድን ነው?",
    hint: "Reference your relevant experience, qualifications, or past results. One real example beats ten general claims.",
    hintAm: "ተዛማጅ ልምድዎን፣ ብቃቶችዎን ወይም ያለፉ ውጤቶችዎን ያጣቅሱ። አንድ እውነተኛ ምሳሌ አስር ጠቅላላ ቃሎችን ይበልጣል።",
    input: {
      type: "textarea",
      placeholder: "e.g. We have prepared over 60 feasibility studies for Ethiopian SMEs, with an 80% bank approval rate. Our team holds certifications in financial analysis from ACCA.",
      placeholderAm: "ለምሳሌ: ለ60 ኢትዮጵያ SMEዎች ጥናቶችን አዘጋጅተናል፣ 80% ከባንክ ፈቃድ ያገኙ ናቸው።",
    },
  },
  {
    id: "evidence",
    stripeNumber: 8,
    question: "Do you have any case studies, testimonials, previous work samples, or credentials to include?",
    questionAm: "የጉዳይ ጥናቶች፣ ምስክርነቶች፣ ቀደም ያሉ ሥራ ናሙናዎች ወይም ምስክር ወረቀቶች አሉዎት?",
    hint: "Concrete evidence — a named client, a specific result, a verifiable credential — turns your proposal from a pitch into proof.",
    hintAm: "ጠቃሚ ማስረጃ — ስም ያለው ደንበኛ፣ ዝርዝር ውጤት — ሃሳብዎን ማስረጃ ያደርገዋል።",
    input: {
      type: "single-select",
      options: [
        { value: "yes", label: "Yes — I will describe them", labelAm: "አዎ — ልግለጻቸው", revealText: true },
        { value: "certs", label: "I have relevant certifications or licences", labelAm: "ተዛማጅ ምስክር ወረቀቶች ወይም ፈቃዶች አሉኝ", revealText: true },
        { value: "none", label: "No past work yet — I will rely on my proposal quality", labelAm: "እስካሁን ሥራ የለኝም — በሃሳቤ ጥራት ላይ እተማምናለሁ" },
      ],
      followUp: { id: "evidenceText", label: "Describe your evidence or credentials", labelAm: "ማስረጃዎ ወይም ምስክር ወረቀቶችዎ ይግለጹ", placeholder: "e.g. Case study: Helped Addis Flower Export increase bank financing by ETB 2M. ACCA Level 2 certified.", placeholderAm: "ለምሳሌ: ጉዳይ ጥናት: አዲስ ፍሎወር ኤክስፖርት ETB 2M ፋይናንስ እንዲያገኝ ረድተናል።", multiLine: true },
    },
  },
  {
    id: "terms",
    stripeNumber: 9,
    question: "What are your key payment and engagement terms?",
    questionAm: "ዋና ዋና የክፍያ እና አሰራር ውሎችዎ ምን ምን ናቸው?",
    hint: "At minimum state: when payment is due, what happens if scope changes, and how either party can end the agreement.",
    hintAm: "ቢያንስ ይጥቀሱ: ክፍያ መቼ ይደርሳል፣ ወሰን ቢቀየር ምን ይሆናል፣ ስምምነቱ እንዴት ይቋረጣል።",
    input: {
      type: "single-select",
      options: [
        { value: "50-50", label: "Standard: 50% upfront, 50% on delivery", labelAm: "መደበኛ: 50% አስቀድሞ፣ 50% በማቅረቡ" },
        { value: "full-upfront", label: "Full payment required before work begins", labelAm: "ሥራ ከመጀመሩ በፊት ሙሉ ክፍያ ያስፈልጋል" },
        { value: "on-delivery", label: "Payment on delivery only", labelAm: "ሲቀርብ ብቻ ክፍያ" },
        { value: "milestones", label: "Milestone-based payments", labelAm: "በምዕራፍ ላይ የተመሰረቱ ክፍያዎች" },
        { value: "custom", label: "I will write custom terms", labelAm: "ብጁ ውሎችን እጽፋለሁ", revealText: true },
      ],
      followUp: { id: "termsDetail", label: "Your custom terms", labelAm: "ብጁ ውሎችዎ", placeholder: "Describe your payment schedule, scope change policy, and cancellation terms.", placeholderAm: "የክፍያ ሰሌዳዎን፣ ለወሰን ለውጥ ፖሊሲዎን፣ እና የመሰረዝ ውሎቹን ይግለጹ።", multiLine: true },
    },
  },
  {
    id: "cta",
    stripeNumber: 10,
    question: "What specific action do you want the client to take after reading this proposal?",
    questionAm: "ሃሳቡን ካነበቡ በኋላ ደንበኛዎ ምን ዝርዝር እርምጃ እንዲወስዱ ትፈልጋለህ?",
    hint: "The clearer the next step, the faster the decision. Ambiguity kills proposals.",
    hintAm: "ቀጣዩ እርምጃ ግልፅ ሲሆን፣ ውሳኔ ፈጣን ይሆናል። ግልፅ ያልሆነ ነገር ሃሳቦችን ይገድላል።",
    input: {
      type: "single-select",
      options: [
        { value: "sign", label: "Sign and return the proposal", labelAm: "ሃሳቡን ፈርሞ ይመልሱ" },
        { value: "meeting", label: "Schedule a meeting to discuss", labelAm: "ለመወያየት ስብሰባ ይቀጥሩ" },
        { value: "payment", label: "Make an initial payment to begin", labelAm: "ለመጀመር መጀመሪያ ክፍያ ያድርጉ" },
        { value: "questions", label: "Contact me with any questions first", labelAm: "ጥያቄ ካለዎት አስቀድሞ ያነጋግሩኝ" },
        { value: "custom", label: "Custom action", labelAm: "ብጁ እርምጃ", revealText: true },
      ],
      followUp: { id: "ctaDetail", label: "Describe the action", labelAm: "እርምጃውን ይግለጹ", placeholder: "e.g. Contact us at info@example.com to book a 30-minute scoping call.", placeholderAm: "ለምሳሌ: info@example.com ያነጋግሩን ለ30 ደቂቃ ጥሪ።", multiLine: false },
    },
  },
  {
    id: "tone",
    stripeNumber: 11,
    question: "What is your relationship with this client and how formal should this proposal be?",
    questionAm: "ከዚህ ደንበኛ ጋር ያለዎት ግንኙነት ምን ያህል ነው፣ ሃሳቡ ምን ያህል መደበኛ ይሁን?",
    hint: "The tone shapes every sentence in the document — from the cover letter to the signature line.",
    hintAm: "ቃናው እያንዳንዱን ዓረፍተ ነገር ይቀርፃል — ከሽፋን ደብዳቤ እስከ ፊርማ ሐሳብ።",
    input: {
      type: "single-select",
      options: [
        { value: "formal", label: "Formal — we have not met, this is a cold approach", labelAm: "መደበኛ — ገና አልተዋወቅንም" },
        { value: "warm", label: "Professional but warm — we have spoken before", labelAm: "ሙያዊ ግን ሞቅ — ቀደም ተናግረናል" },
        { value: "direct", label: "Direct and confident — follow-up to a verbal agreement", labelAm: "ቀጥተኛ — የቃል ስምምነት ተከትሎ" },
        { value: "eth-formal", label: "Ethiopian business formal — traditional formal tone", labelAm: "የኢትዮጵያ ንግድ መደበኛ — ባህላዊ መደበኛ ቃና" },
      ],
    },
    isFinal: true,
  },
];

// ─── ANSWER BUILDER — maps collected answers to document section content ─────

type AnswerMap = Record<string, any>;

function listItems(items: { name: string; desc: string }[]): string {
  return items.map((it, i) => `${i + 1}. ${it.name}${it.desc ? `\n   ${it.desc}` : ""}`).join("\n\n");
}

function multiFieldText(values: Record<string, string>, fields: FieldSpec[]): string {
  return fields
    .filter((f) => values[f.id]?.trim())
    .map((f) => `${f.label}: ${values[f.id]}`)
    .join("\n");
}

export function buildCompanyProfileContents(answers: AnswerMap): Record<string, string> {
  const name = answers.identity?.companyName || "Your Company";
  const oneLiner = answers.identity?.oneLiner || "";
  const story = answers.story || "";
  const missionRaw = answers.mission || "";
  const missionText = typeof missionRaw === "object"
    ? (missionRaw.missionVisionText || "")
    : missionRaw === "help-me"
      ? `Mission: ${name} exists to deliver ${oneLiner}.\n\nVision: A future where every Ethiopian business has access to professional-grade documents and guidance.`
      : "";
  const products: { name: string; desc: string }[] = answers.products || [];
  const markets: string[] = answers.market || [];
  const team: { name: string; desc: string }[] = answers.team || [];
  const proofSelection = typeof answers.proof === "object" ? answers.proof?.value : answers.proof;
  const proofText = typeof answers.proof === "object" ? answers.proof?.text || "" : "";
  const differentiator = answers.differentiator || "";
  const audience = answers.audience || "general";
  const contactFields: Record<string, string> = answers.contact || {};
  const audienceCta: Record<string, string> = {
    investors: "Ready to invest in Ethiopia's next success story? Contact us today to schedule a due diligence meeting.",
    bank: "To request our full credentials package or arrange a meeting with our team, contact us using the details below.",
    corporate: "Let's explore how we can support your business objectives. Reach out to start the conversation.",
    government: "For procurement enquiries, official documentation, or partnership opportunities, contact our business development team.",
    public: "Ready to work with us? Contact us today for a free initial consultation.",
  };

  return {
    cover: [
      `Company: ${name}`,
      oneLiner ? `\n${oneLiner}` : "",
      contactFields.location ? `\nLocation: ${contactFields.location}` : "",
      contactFields.website ? `Website: ${contactFields.website}` : "",
      contactFields.email ? `Email: ${contactFields.email}` : "",
      contactFields.phone ? `Phone: ${contactFields.phone}` : "",
    ].filter(Boolean).join("\n"),

    exec: [
      `${name} is a ${oneLiner}`,
      markets.length ? `\nWe primarily serve ${markets.join(", ").replace(/_/g, " ")}.` : "",
      differentiator ? `\nUnlike our competitors, we are the only company that ${differentiator}` : "",
    ].filter(Boolean).join(""),

    mission: missionText || `Mission: ${name} is committed to delivering exceptional value to its clients.\n\nVision: To be the leading provider of our services in Ethiopia and beyond.\n\nCore Values:\n1. Integrity — We do what we say.\n2. Excellence — We set the bar higher every time.\n3. Impact — Every service must move our clients forward.`,

    history: story || `${name} was established with a clear purpose: to fill a gap that was holding Ethiopian businesses back.\n\n[Add your founding story, key milestones, and growth journey here.]`,

    products: products.length
      ? listItems(products)
      : `[List your main products or services here. Include a name and description for each one.]`,

    market: [
      markets.length ? `Our primary customer segments include: ${markets.join(", ")}.` : "",
      `\n\n[Describe your ideal customer in detail — their industry, location, size, and the specific problem you solve for them.]`,
    ].join(""),

    team: team.length
      ? listItems(team)
      : `[Name the key people in your company, their roles, and their most relevant qualifications.]`,

    achievements: proofSelection !== "none" && proofText
      ? proofText
      : `[This section will be updated as ${name} grows. Contact us to discuss our current credentials and references.]`,

    clients: proofSelection !== "none" && proofText
      ? `${proofText}\n\n[Additional case studies and client references available upon request.]`
      : `Our track record is growing. Contact us to learn more about how we have helped businesses like yours.`,

    "why-us": [
      differentiator ? `Unlike our competitors, we are the only company that ${differentiator}` : "",
      `\n\n[Expand here on what makes your approach, methodology, or team uniquely qualified to deliver results in your sector.]`,
    ].filter(Boolean).join(""),

    contact: [
      `Get in touch with ${name}:`,
      contactFields.email ? `\nEmail: ${contactFields.email}` : "",
      contactFields.phone ? `Phone: ${contactFields.phone}` : "",
      contactFields.website ? `Website: ${contactFields.website}` : "",
      contactFields.location ? `Address: ${contactFields.location}` : "",
      `\n\n${audienceCta[audience] || audienceCta.public}`,
    ].filter(Boolean).join("\n"),
  };
}

export function buildBusinessProposalContents(answers: AnswerMap): Record<string, string> {
  const recipientName = answers.recipient?.recipientName || "Valued Client";
  const recipientOrg = answers.recipient?.recipientOrg || "";
  const problem = answers.problem || "";
  const solution = answers.solution || "";
  const deliverables: { name: string; desc: string }[] = answers.deliverables || [];
  const timelineSelection = typeof answers.timeline === "object" ? answers.timeline?.value : answers.timeline;
  const timelineDetail = typeof answers.timeline === "object" ? answers.timeline?.text || "" : "";
  const pricingSelection = typeof answers.pricing === "object" ? answers.pricing?.value : answers.pricing;
  const pricingDetail = typeof answers.pricing === "object" ? answers.pricing?.text || "" : "";
  const whyUs = answers["why-us"] || "";
  const evidenceSelection = typeof answers.evidence === "object" ? answers.evidence?.value : answers.evidence;
  const evidenceText = typeof answers.evidence === "object" ? answers.evidence?.text || "" : "";
  const termsSelection = typeof answers.terms === "object" ? answers.terms?.value : answers.terms;
  const termsDetail = typeof answers.terms === "object" ? answers.terms?.text || "" : "";
  const ctaSelection = typeof answers.cta === "object" ? answers.cta?.value : answers.cta;
  const ctaDetail = typeof answers.cta === "object" ? answers.cta?.text || "" : "";
  const tone = answers.tone || "formal";

  const timelineLabels: Record<string, string> = {
    "less-1w": "less than 1 week",
    "1-2w": "1–2 weeks",
    "2-4w": "2–4 weeks",
    "1-3m": "1–3 months",
    "3-6m": "3–6 months",
    "6m+": "more than 6 months",
  };
  const timelineStr = timelineLabels[timelineSelection] || timelineDetail || "as agreed";

  const standardTermsMap: Record<string, string> = {
    "50-50": "Payment Terms: 50% of the agreed fee is due upon signing this proposal. The remaining 50% is due upon final delivery of all agreed deliverables.",
    "full-upfront": "Payment Terms: Full payment is required before work commences. No work will begin until payment is confirmed.",
    "on-delivery": "Payment Terms: Full payment is due upon delivery and acceptance of all agreed deliverables.",
    "milestones": "Payment Terms: Payments are due at each agreed project milestone, as outlined in the timeline section.",
  };
  const termsText = termsDetail || standardTermsMap[termsSelection] || "Payment terms to be agreed upon acceptance of this proposal.";

  const ctaLabels: Record<string, string> = {
    sign: "To accept this proposal, please sign below and return a copy to us.",
    meeting: "To discuss this proposal further, please schedule a meeting with our team.",
    payment: "To proceed, please make the initial payment as described in the investment section.",
    questions: "If you have any questions before deciding, we welcome your call or email.",
  };
  const ctaText = ctaDetail || ctaLabels[ctaSelection] || "Please contact us to discuss the next steps.";

  return {
    cover: [
      `Business Proposal`,
      solution ? `\n${solution.split(".")[0]}.` : "",
      `\n\nPrepared for: ${recipientName}${recipientOrg ? `, ${recipientOrg}` : ""}`,
      `Prepared by: [Your Name / Company]`,
      `Date: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
    ].filter(Boolean).join("\n"),

    exec: [
      problem ? `${problem}` : "",
      solution ? `\n\nWe propose to ${solution}` : "",
      `\n\nThis engagement will deliver measurable results within ${timelineStr}, at a clearly defined investment. ${ctaText}`,
    ].filter(Boolean).join(""),

    problem: problem || `[Describe the specific problem or opportunity that this proposal addresses. Ground it in the client's situation, not your capabilities.]`,

    solution: solution || `[Describe exactly what you will do, how, and why your approach is the right one for this specific situation.]`,

    scope: deliverables.length
      ? listItems(deliverables)
      : `[List the specific deliverables the client will receive — each with a clear description and acceptance criteria.]`,

    timeline: timelineDetail || (timelineSelection && timelineSelection !== "custom"
      ? `Estimated duration: ${timelineStr}\n\n[Break this down into phases with key milestones and delivery dates.]`
      : `[Define the project phases, key milestones, and final delivery date.]`),

    pricing: pricingDetail || `[Provide a clear breakdown of the investment required — whether fixed price, per deliverable, or retainer. Include what is and is not covered.]`,

    "why-us": [
      whyUs || "[Describe your qualifications, experience, and why you are the right team for this project.]",
      evidenceSelection !== "none" && evidenceText ? `\n\n${evidenceText}` : "",
      evidenceSelection === "none" ? "\n\nSupporting case studies and references are available upon request." : "",
    ].filter(Boolean).join(""),

    terms: [
      termsText,
      "\n\nScope Changes: Any changes to the agreed scope of work must be documented in writing and may result in revised pricing and timelines.",
      "\nCancellation: Either party may cancel this agreement with [X] days written notice. Work completed to date will be invoiced at the agreed rate.",
      "\nConfidentiality: Both parties agree to keep all project-related information confidential.",
    ].join(""),

    "next-steps": [
      ctaText,
      `\n\n──────────────────────────────────────────`,
      `\nClient Acceptance`,
      `\nBy signing below, ${recipientName}${recipientOrg ? ` (${recipientOrg})` : ""} agrees to the terms of this proposal.`,
      `\n\nSignature: _________________________    Date: ___________`,
      `\nPrinted Name: ______________________`,
      `\n\nService Provider`,
      `\nSignature: _________________________    Date: ___________`,
      `\nPrinted Name: ______________________`,
    ].join("\n"),

    appendix: evidenceSelection !== "none" && evidenceText
      ? evidenceText
      : `[This section can include supporting data, references, sample work, or sector benchmarks that strengthen the proposal. Add as needed.]`,
  };
}
