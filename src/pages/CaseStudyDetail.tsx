
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Globe, Twitter, Instagram, Youtube } from "lucide-react";
import { FreemiumGate } from "@/components/FreemiumGate";

interface CaseStudySection {
  id: string;
  title: string;
  isActive?: boolean;
}

const CaseStudyDetail = () => {
  const { id } = useParams();
  const [savedStories, setSavedStories] = useState<string[]>([]);

  // Mock data - in a real app, this would come from an API based on the ID
  const caseStudy = {
    id: "us-tech-startup-success",
    title: "How This US Tech Startup Successfully Entered Australia And Reached $2M ARR",
    companyName: "CloudScale Solutions",
    website: "cloudscale.com.au",
    originCountry: "United States",
    targetMarket: "Australia",
    entryDate: "March 2022",
    publishDate: "December 15th, 2023",
    monthlyRevenue: "$167,000",
    entryCosts: "$75,000",
    profitable: "Yes",
    founders: 2,
    employees: 15,
    founderName: "Marcus Chen & Lisa Rodriguez",
    founderImage: "/placeholder.svg",
    socialLinks: {
      twitter: "#",
      instagram: "#",
      youtube: "#"
    },
    outcome: "Success"
  };

  const sections: CaseStudySection[] = [
    { id: "company", title: "About The Company", isActive: true },
    { id: "market-research", title: "Australian Market Research" },
    { id: "entry-strategy", title: "Market Entry Strategy" },
    { id: "regulatory", title: "Regulatory & Compliance Challenges" },
    { id: "partnerships", title: "Building Local Partnerships" },
    { id: "team", title: "Hiring & Building Australian Team" },
    { id: "marketing", title: "Marketing & Customer Acquisition" },
    { id: "revenue", title: "Revenue Growth & Financials" },
    { id: "challenges", title: "Biggest Challenges Faced" },
    { id: "lessons", title: "Key Lessons Learned" },
    { id: "tools", title: "Essential Tools & Resources" },
    { id: "advice", title: "Advice For Market Entry" },
    { id: "future", title: "Future Plans In Australia" }
  ];

  const toggleSave = () => {
    if (savedStories.includes(caseStudy.id)) {
      setSavedStories(savedStories.filter(id => id !== caseStudy.id));
    } else {
      setSavedStories([...savedStories, caseStudy.id]);
    }
  };

  return (
    <>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar Navigation */}
          <aside className="w-80 flex-shrink-0">
            <div className="sticky top-8">
              <h2 className="text-lg font-semibold mb-4 text-foreground">
                {caseStudy.title}
              </h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      section.isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <FreemiumGate
              contentType="case-study"
              itemId={id || ""}
              contentTitle={caseStudy.title}
              contentDescription={`A detailed case study of ${caseStudy.companyName}'s market entry from ${caseStudy.originCountry} to ${caseStudy.targetMarket}`}
            >
              <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={caseStudy.founderImage}
                  alt={caseStudy.companyName}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-1">
                    {caseStudy.companyName}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Market Entry Case Study</span>
                    <span>Tools & Resources</span>
                    <span>{caseStudy.originCountry} → {caseStudy.targetMarket}</span>
                  </div>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-foreground mb-4">
                {caseStudy.title}
              </h1>

              <p className="text-muted-foreground mb-6">
                Published {caseStudy.publishDate} • Market Entry: {caseStudy.entryDate}
              </p>

              {/* Company Info Card */}
              <Card className="bg-primary/5 border-primary/20 mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">MARKET ENTRY</Badge>
                      <Badge>CASE STUDY</Badge>
                      <Badge variant="secondary">AUSTRALIA</Badge>
                      <Badge variant={caseStudy.outcome === "Success" ? "default" : "destructive"}>
                        {caseStudy.outcome}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleSave}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Heart 
                        className={`w-4 h-4 mr-1 ${
                          savedStories.includes(caseStudy.id) ? "fill-current text-red-500" : ""
                        }`} 
                      />
                      SAVE STORY
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-8">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{caseStudy.companyName}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{caseStudy.website}</p>
                      <p className="text-sm text-muted-foreground mb-1">from {caseStudy.originCountry}</p>
                      <p className="text-sm text-muted-foreground mb-3">entered AU {caseStudy.entryDate}</p>
                      <div className="flex gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <Twitter className="w-4 h-4 text-muted-foreground" />
                        <Instagram className="w-4 h-4 text-muted-foreground" />
                        <Youtube className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground mb-1">
                        {caseStudy.monthlyRevenue}
                      </div>
                      <div className="text-sm text-muted-foreground">MONTHLY REVENUE (AU)</div>
                    </div>

                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground mb-1">
                        {caseStudy.founders}
                      </div>
                      <div className="text-sm text-muted-foreground">FOUNDERS</div>
                    </div>

                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground mb-1">
                        {caseStudy.employees}
                      </div>
                      <div className="text-sm text-muted-foreground">EMPLOYEES (AU)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  CloudScale Solutions, a successful US-based SaaS company serving enterprise clients, 
                  decided to expand to Australia in early 2022. After 18 months of strategic market entry 
                  efforts, they've built a thriving Australian operation generating $167,000 monthly revenue 
                  and serving major Australian enterprises across Sydney and Melbourne.
                </p>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  This case study details their complete market entry journey, including the regulatory 
                  hurdles they navigated, the local partnerships they built, their hiring strategy for 
                  building an Australian team, and the marketing approaches that drove rapid customer 
                  acquisition in a competitive market.
                </p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
                  Hello! Tell us about your company and why you decided to enter the Australian market.
                </h2>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  Hi, I'm Marcus Chen, co-founder of CloudScale Solutions along with my partner Lisa Rodriguez. 
                  We built CloudScale as a cloud infrastructure management platform for enterprise clients, 
                  and by 2021 we were doing about $8M ARR in the US market. 
                </p>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  Australia became attractive to us because of the strong demand for cloud solutions, 
                  the regulatory environment that favored data sovereignty, and the fact that many 
                  Australian enterprises were looking for alternatives to US-only providers. We saw 
                  an opportunity to be early in a growing market with less competition than what we 
                  faced in Silicon Valley.
                </p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
                  What was your market research process for Australia?
                </h2>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  We spent six months doing deep market research before making any commitments. We hired 
                  a local market research firm in Sydney to conduct surveys with IT directors at ASX 200 
                  companies. We also attended three major Australian tech conferences virtually to understand 
                  the competitive landscape and customer pain points.
                </p>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  The key insight was that Australian enterprises were frustrated with data residency 
                  requirements and wanted cloud solutions with guaranteed Australian data storage. 
                  This became our core value proposition and differentiated us from global competitors 
                  who couldn't make the same guarantees.
                </p>
              </div>
            </div>
            </FreemiumGate>
          </main>

          {/* Right Sidebar */}
          <aside className="w-80 flex-shrink-0">
            <div className="sticky top-8 space-y-6">
              {/* About Company Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Market Entry Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Revenue (AU)</span>
                      <span className="font-medium">{caseStudy.monthlyRevenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entry Investment</span>
                      <span className="font-medium">{caseStudy.entryCosts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profitable</span>
                      <span className="font-medium">{caseStudy.profitable}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Origin Country</span>
                      <span className="font-medium">{caseStudy.originCountry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entry Date</span>
                      <span className="font-medium">{caseStudy.entryDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">AU Employees</span>
                      <span className="font-medium">{caseStudy.employees}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Entry Guide Card */}
              <Card className="bg-card">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">Australian Market Entry Guide</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get our comprehensive guide to entering the Australian market
                  </p>
                  <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                    Download Free Guide
                  </Button>
                </CardContent>
              </Card>

              {/* Related Resources Card */}
              <Card className="bg-card">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">Related Stories</h3>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <Link to="/case-studies/uk-ecommerce-failure" className="text-primary hover:underline">
                        Why Our UK E-commerce Brand Failed In Australia
                      </Link>
                    </div>
                    <div className="text-sm">
                      <Link to="/case-studies/german-manufacturing-success" className="text-primary hover:underline">
                        German Manufacturing Success Story
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
      
    </>
  );
};

export default CaseStudyDetail;
