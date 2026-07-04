// Top 10 market entry questions — shared source of truth for the
// /market-entry-questions hub page and the FAQPage JSON-LD it emits.
// Article bodies live in the database (content_items) and are seeded
// by supabase/migrations/*_seed_market_entry_questions.sql.

export interface MarketEntryQuestion {
  slug: string;
  title: string;
  question: string;
  teaser: string;
  answer: string;
}

export const MARKET_ENTRY_QUESTIONS: MarketEntryQuestion[] = [
  {
    slug: "how-to-choose-market-entry-strategy-australia",
    title: "How to choose the right market entry strategy for Australia",
    question: "Which market entry strategy is right for entering Australia?",
    teaser:
      "Exporting, licensing, a local subsidiary, a joint venture or acquisition — each carries different capital, control and speed trade-offs in the Australian market.",
    answer:
      "The right Australian market entry strategy depends on how much control you need, how much capital you can commit, and how fast you want revenue. Most international companies start with exporting or a distributor to test demand, then move to a Pty Ltd subsidiary once orders and support obligations justify it. Regulated categories such as medtech, fintech and food usually require a local entity from day one so ACCC, TGA, APRA or FSANZ registrations sit under an Australian legal person.",
  },
  {
    slug: "how-to-choose-target-market-australia-nz",
    title: "How to decide whether Australia or New Zealand is your first ANZ market",
    question: "Should I enter Australia or New Zealand first?",
    teaser:
      "Australia is roughly five times the GDP of New Zealand, but NZ is often faster, cheaper and more forgiving as a proving ground before an east-coast Australian launch.",
    answer:
      "Australia offers scale — around AUD 2.6 trillion GDP concentrated in Sydney, Melbourne and Brisbane — while New Zealand offers speed, a single regulator per domain and easier access to enterprise pilots. Many founders use NZ as a live beta, then use the CER (Closer Economic Relations) and TTMR frameworks to move product, standards and even licences across the Tasman.",
  },
  {
    slug: "australia-market-entry-regulatory-compliance",
    title: "Regulatory and compliance requirements for entering Australia",
    question: "What are the regulatory and compliance requirements for entering Australia?",
    teaser:
      "ASIC registration, an ABN and TFN, GST above the AUD 75,000 threshold, Fair Work obligations, and sector regulators like TGA, ACMA, APRA or FSANZ.",
    answer:
      "Every commercial entity needs an ABN and TFN, must register for GST once turnover reaches AUD 75,000, and — if hiring locally — must comply with the Fair Work Act, superannuation (11.5% in 2025–26) and payroll tax. Foreign investment above FIRB thresholds requires Treasury approval, and industry regulators (TGA, ACMA, APRA, ASIC, FSANZ, ARPANSA) add licensing on top.",
  },
  {
    slug: "competitor-analysis-australian-market",
    title: "How to map competitors and differentiate in the Australian market",
    question: "How do I map competitors and differentiate in Australia?",
    teaser:
      "Australia's markets are concentrated — often two or three dominant local players plus one global incumbent — so the differentiation question is usually price, service SLA or channel access, not features.",
    answer:
      "Most Australian B2B categories are dominated by two or three incumbents (think Coles/Woolworths, CBA/Westpac/NAB/ANZ, Telstra/Optus/TPG). Winning share means either undercutting on total cost of ownership, providing a service level the incumbents refuse to match, or reaching a channel they underserve — mid-market, resources towns, or ANZ subsidiaries of your existing global customers.",
  },
  {
    slug: "cost-of-entering-australian-market",
    title: "What it really costs to enter the Australian market",
    question: "How much does it cost to enter the Australian market?",
    teaser:
      "A realistic first-year budget for a lean B2B entry sits between AUD 250k and AUD 750k once you include an entity, one local hire, compliance, marketing and working capital.",
    answer:
      "A Pty Ltd company costs about AUD 600 to register plus AUD 320 annually to ASIC. One senior local hire — a country manager or head of sales — typically costs AUD 180k–250k fully loaded including 11.5% super. Add legal setup (AUD 10k–25k), insurance (AUD 5k–15k), a Sydney or Melbourne serviced office (AUD 1k–3k per desk per month), localisation, marketing and 6–9 months of working capital.",
  },
  {
    slug: "distributor-vs-direct-entry-australia",
    title: "Distributor, partner or direct: choosing your ANZ go-to-market model",
    question: "Do I need a local distributor, partner or direct entry in Australia?",
    teaser:
      "Distributors are fastest to revenue but cap your margin and customer intimacy; direct entry is slower and heavier but essential for enterprise, regulated and post-sales-intensive products.",
    answer:
      "For commoditised or high-volume physical goods, an established Australian distributor with existing retailer or reseller relationships (Bunnings, Officeworks, JB Hi-Fi, Ingram Micro, Dicker Data) will get you to revenue in weeks rather than quarters. For SaaS, medtech and industrial equipment where the buyer expects a direct relationship and local implementation, direct entry via a Pty Ltd subsidiary is usually the right call.",
  },
  {
    slug: "how-long-market-entry-australia-takes",
    title: "How long market entry into Australia takes and when you'll see returns",
    question: "How long does market entry into Australia take?",
    teaser:
      "Plan for 3–6 months to set up, 6–12 months to close your first meaningful contracts, and 18–36 months to reach break-even in a B2B market.",
    answer:
      "Entity setup, banking, insurance and a first local hire realistically take 3–6 months. Australian enterprise buyers run long procurement cycles — 6–9 months is normal for a first contract with a bank, insurer, health service or government agency, and vendor onboarding adds another 4–8 weeks.",
  },
  {
    slug: "australia-market-entry-risks-mitigation",
    title: "The biggest risks of entering the Australian market and how to mitigate them",
    question: "What are the biggest risks of entering the Australian market?",
    teaser:
      "AUD volatility, high labour costs, a small addressable buyer set in each category, and heavier consumer-law and privacy exposure than most founders expect.",
    answer:
      "The most common ways market entries fail here are underestimating labour costs (a mid-level engineer costs AUD 140k–180k plus 11.5% super), underestimating the Australian Consumer Law's non-excludable guarantees, and building a plan around a total addressable buyer list that turns out to have only 20–40 real accounts. Mitigate with AUD hedging, a fractional country lead before a full-time hire, and Australian Consumer Law and Privacy Act 1988 reviews before you sign your first customer.",
  },
  {
    slug: "control-vs-flexibility-market-entry-anz",
    title: "Balancing control and flexibility when entering ANZ",
    question: "How much control versus flexibility do I need in my ANZ entry?",
    teaser:
      "A wholly-owned subsidiary gives you brand, data and pricing control; a distributor, JV or licensing deal is faster and cheaper to reverse if the market doesn't respond.",
    answer:
      "Control matters most when your product depends on data, pricing consistency or a specific customer experience — SaaS, luxury, medtech, financial services. Flexibility matters most when you're still validating demand, when the category is fragmented, or when a local partner controls the distribution you need.",
  },
  {
    slug: "localising-product-pricing-marketing-australia",
    title: "Localising your product, pricing and marketing for Australian buyers",
    question: "How do I localise product, pricing and marketing for Australia?",
    teaser:
      "Price in AUD inclusive of GST, switch to Australian English and local proof points, and rebuild your channel mix around LinkedIn, Google and industry associations rather than the channels that work at home.",
    answer:
      "Australian buyers expect AUD pricing inclusive of 10% GST, Australian English (organise, colour, licence), and case studies from ANZ customers or at least APAC. Enterprise procurement will ask for data residency in Australian AWS/Azure regions, an Australian Business Number on invoices, and Modern Slavery Act statements above AUD 100m turnover.",
  },
];