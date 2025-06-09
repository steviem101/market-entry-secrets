
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Globe, Twitter, Instagram, Youtube } from "lucide-react";

interface ContentSection {
  id: string;
  title: string;
  isActive?: boolean;
}

const ContentDetail = () => {
  const { id } = useParams();
  const [savedStories, setSavedStories] = useState<string[]>([]);

  // Mock data based on the content type - in a real app, this would come from an API
  const content = {
    id: id || "market-entry-guide",
    title: "How This US Tech Startup Successfully Entered Australia And Reached $2M ARR",
    companyName: "CloudScale Solutions",
    website: "cloudscale.com.au",
    originCountry: "United States",
    targetMarket: "Australia",
    entryDate: "March 2022",
    publishDate: "April 11th, 2025",
    monthlyRevenue: "$167K",
    entryCosts: "$75,000",
    profitable: "Yes",
    founders: 2,
    employees: 20,
    founderName: "Marcus Chen",
    founderTitle: "Founder, CloudScale Solutions",
    founderImage: "/placeholder.svg",
    socialLinks: {
      twitter: "#",
      instagram: "#",
      youtube: "#"
    },
    outcome: "Success"
  };

  const sections: ContentSection[] = [
    { id: "company", title: "About The Company", isActive: true },
    { id: "market-research", title: "What problem does your business solve?" },
    { id: "entry-strategy", title: "Founder-Market Fit" },
    { id: "partnerships", title: "More Business Ideas Like This" }
  ];

  const toggleSave = () => {
    if (savedStories.includes(content.id)) {
      setSavedStories(savedStories.filter(id => id !== content.id));
    } else {
      setSavedStories([...savedStories, content.id]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/content">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Content
            </Button>
          </Link>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar Navigation */}
          <aside className="w-80 flex-shrink-0">
            <div className="sticky top-8">
              <div className="mb-6">
                <h2 className="text-sm font-medium text-muted-foreground mb-2">
                  {content.companyName}
                </h2>
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  Make ${content.monthlyRevenue}/Month
                </h3>
              </div>
              
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
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={content.founderImage}
                  alt={content.companyName}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-1">
                    {content.companyName}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Interview</span>
                  </div>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-foreground mb-4">
                {content.title}
              </h1>

              <p className="text-muted-foreground mb-6">
                {content.publishDate}
              </p>

              {/* Company Info Card */}
              <Card className="bg-primary/5 border-primary/20 mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge>ABOUT</Badge>
                      <Badge variant="secondary">BUSINESS</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleSave}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Heart 
                        className={`w-4 h-4 mr-1 ${
                          savedStories.includes(content.id) ? "fill-current text-red-500" : ""
                        }`} 
                      />
                      SAVE
                    </Button>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4">
                      <img
                        src={content.founderImage}
                        alt={content.founderName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-foreground">{content.founderName}</h3>
                        <p className="text-sm text-muted-foreground">{content.founderTitle}</p>
                        <div className="flex gap-2 mt-2">
                          <Twitter className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer" />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-8 ml-auto">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          {content.monthlyRevenue}
                        </div>
                        <div className="text-xs text-muted-foreground">REVENUE/MO</div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          {content.founders}
                        </div>
                        <div className="text-xs text-muted-foreground">FOUNDERS</div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          {content.employees}
                        </div>
                        <div className="text-xs text-muted-foreground">EMPLOYEES</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
                  Who are you and what business did you start?
                </h2>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  {content.founderName} is the co-founder of {content.companyName}, an online platform that helps businesses successfully enter the Australian market. The company provides comprehensive market entry services including regulatory compliance, local partnerships, and strategic guidance.
                </p>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  Before co-founding {content.companyName}, {content.founderName} worked extensively in international business development and saw the challenges companies faced when trying to expand into new markets. He holds a business degree and has over 10 years of experience in market expansion strategies.
                </p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
                  What's your backstory and how did you come up with the idea?
                </h2>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  The idea for {content.companyName} came from personal experience trying to help international companies navigate the Australian market. After seeing countless businesses struggle with regulatory requirements, cultural differences, and local business practices, we realized there was a significant gap in the market for comprehensive market entry services.
                </p>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  We started by helping a few companies informally and quickly realized the demand was much larger than we anticipated. The success of our early clients gave us the confidence to formalize our services and build a scalable platform.
                </p>
              </div>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="w-80 flex-shrink-0">
            <div className="sticky top-8 space-y-6">
              {/* About Company Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">About {content.companyName}</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Revenue</span>
                      <span className="font-medium">{content.monthlyRevenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profitable</span>
                      <span className="font-medium">{content.profitable}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Founders</span>
                      <span className="font-medium">{content.founders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Employees</span>
                      <span className="font-medium">{content.employees}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Entry Guide Card */}
              <Card className="bg-card">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">Market Entry Secrets</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    See exactly how online businesses get to millions in revenue
                  </p>
                  <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                    Join Market Entry Secrets
                  </Button>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ContentDetail;
