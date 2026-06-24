
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/common/SEOHead";

interface FaqItem {
  id: string;
  q: string;
  a: string;
}

interface FaqCategory {
  title: string;
  description: string;
  items: FaqItem[];
}

// Single source of truth: drives both the rendered accordions and the
// FAQPage structured data below, so the two can never drift apart.
const FAQ_CATEGORIES: FaqCategory[] = [
  {
    title: "About the platform",
    description: "What Market Entry Secrets is and who it serves",
    items: [
      {
        id: "what-is",
        q: "What is Market Entry Secrets?",
        a: "Market Entry Secrets is an intelligence and execution platform for the Australian and New Zealand market. We combine vetted service providers, mentors, investors, events, lead data, and case studies with an AI report generator that builds a tailored plan, whether you are entering ANZ from overseas or scaling a business you already run here.",
      },
      {
        id: "who-for",
        q: "Who is this platform for?",
        a: "Two groups: international companies entering and scaling in ANZ, and Australian and New Zealand founders and operators growing within their home market. It is also used by the service providers, mentors, and advisors who support them.",
      },
      {
        id: "anz-coverage",
        q: "Do you cover New Zealand as well as Australia?",
        a: "Yes. Our providers, mentors, events, and intelligence span both Australia and New Zealand. You can also browse resources by location, country, and sector.",
      },
    ],
  },
  {
    title: "Reports and AI",
    description: "How the AI report generator works",
    items: [
      {
        id: "how-report-works",
        q: "How does the AI report work?",
        a: "Answer a few questions about your company, sector, and goals in our report creator. Our engine gathers live market data, researches your sector and competitors, and matches you with relevant providers and mentors, then generates a structured report. A typical report is ready in minutes, not weeks.",
      },
      {
        id: "report-includes",
        q: "What is included in a report?",
        a: "Depending on your plan, a report can include an executive summary, SWOT analysis, competitor landscape, matched service providers, mentor recommendations, relevant events and resources, a step-by-step action plan, and a curated lead list. Sections you have not unlocked stay hidden until you upgrade.",
      },
      {
        id: "report-access",
        q: "Can I access my report later or share it?",
        a: "Yes. Your reports are saved to your dashboard under My Reports, and you can generate a shareable link to send a report to colleagues or partners.",
      },
    ],
  },
  {
    title: "Plans and pricing",
    description: "Free access, paid plans, and how billing works",
    items: [
      {
        id: "is-it-free",
        q: "Is the platform free to use?",
        a: "Yes, there is a free plan. You can browse the directories, explore events and location guides, read sample case studies, and generate a summary report with an action plan at no cost. Paid plans unlock the full AI report and deeper data.",
      },
      {
        id: "paid-plans",
        q: "What do the paid plans include?",
        a: "Growth adds the full report (SWOT, competitor landscape, and mentor matches) plus more guides and support. Scale adds a curated lead list, investor recommendations, and access to the leads and market-sizing marketplace. Enterprise is a tailored program with a dedicated account manager. Current prices are on our Pricing page.",
      },
      {
        id: "subscription",
        q: "Is this a subscription?",
        a: "No. Paid plans are one-time payments, not recurring subscriptions. Once you unlock a tier, the matching report sections and access stay available to you. Upgrading later instantly reveals sections that were already generated in your report.",
      },
    ],
  },
  {
    title: "Directories and connections",
    description: "What you can find and how listings are vetted",
    items: [
      {
        id: "directories",
        q: "What can I find in the directories?",
        a: "Vetted service providers, mentors and advisors, investors, innovation hubs and accelerators, government and trade support agencies, events, lead databases, and case studies. You can filter by location, country, and sector, and bookmark anything to revisit later.",
      },
      {
        id: "vetting",
        q: "How are providers and mentors vetted?",
        a: "Every listing is reviewed before it goes live so you are connecting with credible, relevant partners rather than an open directory. Profiles show specialties, location, and background so you can compare and reach out directly.",
      },
    ],
  },
  {
    title: "Partners and support",
    description: "Getting listed and getting help",
    items: [
      {
        id: "get-listed",
        q: "I am a provider, mentor, or event organiser. How do I get listed?",
        a: "Apply through our Partner With Us page. Tell us about your services or expertise, and our team reviews each application for quality and relevance before publishing your listing.",
      },
      {
        id: "support",
        q: "How do I get support?",
        a: "Reach our team through the Contact page, or email hello@marketentrysecrets.com.au. We typically respond within 24 to 48 hours. Paid plans include priority support.",
      },
    ],
  },
];

const FAQ_ITEMS: FaqItem[] = FAQ_CATEGORIES.flatMap((category) => category.items);

const FAQ = () => {
  return (
    <>
      <SEOHead
        title="FAQ | Market Entry Secrets"
        description="Answers about using Market Entry Secrets to enter the ANZ market or to scale your Australian or New Zealand business."
        canonicalPath="/faq"
        jsonLd={{
          type: "FAQPage",
          data: {
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          },
        }}
      />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8 text-center">Frequently Asked Questions</h1>

          <div className="space-y-8">
            {FAQ_CATEGORIES.map((category) => (
              <Card key={category.title}>
                <CardHeader>
                  <CardTitle>{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.items.map((item) => (
                      <AccordionItem key={item.id} value={item.id}>
                        <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                        <AccordionContent>{item.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Still have questions */}
          <Card className="mt-8">
            <CardHeader className="text-center">
              <CardTitle>Still Have Questions?</CardTitle>
              <CardDescription>We're here to help with any other questions you might have</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-x-4">
                <Button asChild>
                  <Link to="/contact">Contact Us</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/partner">Partner With Us</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default FAQ;
