
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Globe, Twitter, Instagram, Youtube } from "lucide-react";

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
    id: "wayward-home",
    title: "How This Journalist Started A $20K/Month Blog About Nomadic Lifestyle After Being Laid Off",
    companyName: "The Wayward Home",
    website: "thewaywardhome.com",
    country: "United States",
    startDate: "June 2017",
    publishDate: "November 30th, 2023",
    monthlyRevenue: "$20,000",
    startupCosts: "$50",
    profitable: "Yes",
    founders: 1,
    employees: 0,
    founderName: "Sarah Mitchell",
    founderImage: "/placeholder.svg",
    socialLinks: {
      twitter: "#",
      instagram: "#",
      youtube: "#"
    }
  };

  const sections: CaseStudySection[] = [
    { id: "company", title: "About The Company", isActive: true },
    { id: "idea", title: "Coming Up With The Idea" },
    { id: "process", title: "Take us through the process of building the first version of your product." },
    { id: "launching", title: "Launching The Business" },
    { id: "growing", title: "Growing The Business" },
    { id: "revenue", title: "Revenue + Financials" },
    { id: "lessons", title: "Lessons Learned" },
    { id: "tools", title: "Recommended Tools" },
    { id: "resources", title: "Books & Resources" },
    { id: "advice", title: "Advice For Founders" },
    { id: "hiring", title: "Are you looking to hire for certain positions right now?" },
    { id: "learn", title: "Learn More" },
    { id: "ideas", title: "More Business Ideas Like This" }
  ];

  const toggleSave = () => {
    if (savedStories.includes(caseStudy.id)) {
      setSavedStories(savedStories.filter(id => id !== caseStudy.id));
    } else {
      setSavedStories([...savedStories, caseStudy.id]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
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
                    <span>Interview</span>
                    <span>Tools</span>
                  </div>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-foreground mb-4">
                {caseStudy.title}
              </h1>

              <p className="text-muted-foreground mb-6">
                {caseStudy.publishDate}
              </p>

              {/* Company Info Card */}
              <Card className="bg-primary/5 border-primary/20 mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">ABOUT</Badge>
                      <Badge>BUSINESS</Badge>
                      <Badge variant="secondary">TOOLS</Badge>
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
                      SAVE
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-8">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{caseStudy.companyName}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{caseStudy.website}</p>
                      <p className="text-sm text-muted-foreground mb-1">from {caseStudy.country}</p>
                      <p className="text-sm text-muted-foreground mb-3">started {caseStudy.startDate}</p>
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
                      <div className="text-sm text-muted-foreground">REVENUE/MO</div>
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
                      <div className="text-sm text-muted-foreground">EMPLOYEES</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  After being laid off from her journalism job, Sarah decided to turn her passion for travel 
                  and nomadic lifestyle into a business. What started as a personal blog about her travels 
                  has grown into a thriving online business generating $20,000 per month through affiliate 
                  marketing, sponsored content, and digital products.
                </p>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  The Wayward Home provides practical advice, destination guides, and resources for people 
                  interested in location independence and remote work. Through consistent content creation 
                  and building genuine relationships with her audience, Sarah has created multiple revenue 
                  streams while living the lifestyle she promotes.
                </p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
                  Hello! Who are you and what business did you start?
                </h2>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  Hi, I'm Sarah Mitchell, and I'm the founder of The Wayward Home. After getting laid off 
                  from my journalism job in 2017, I decided to take a leap of faith and travel while 
                  building an online business. What started as a travel blog documenting my nomadic journey 
                  has evolved into a comprehensive resource for digital nomads and remote workers.
                </p>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  Today, The Wayward Home generates around $20,000 per month through various revenue streams 
                  including affiliate marketing, sponsored content, digital courses, and consulting services. 
                  We help thousands of people each month learn how to work remotely and travel the world.
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
                  <h3 className="font-semibold text-foreground mb-4">About The Wayward Home</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Revenue</span>
                      <span className="font-medium">{caseStudy.monthlyRevenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Startup Costs</span>
                      <span className="font-medium">{caseStudy.startupCosts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profitable</span>
                      <span className="font-medium">{caseStudy.profitable}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Founders</span>
                      <span className="font-medium">{caseStudy.founders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Employees</span>
                      <span className="font-medium">{caseStudy.employees}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Starter Story Card */}
              <Card className="bg-card">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">Starter Story</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    See exactly how online businesses get to millions in revenue
                  </p>
                  <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                    Join Starter Story
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

export default CaseStudyDetail;
