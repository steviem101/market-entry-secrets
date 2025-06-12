
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, TrendingUp, Users, FileText, Play, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Content = () => {
  const contentCategories = [
    {
      icon: BookOpen,
      title: "Market Entry Guides",
      description: "Step-by-step guides for entering the Australian market",
      count: "12 guides",
      color: "text-blue-600"
    },
    {
      icon: TrendingUp,
      title: "Success Stories",
      description: "Real businesses that conquered the Australian market",
      count: "48 stories",
      color: "text-green-600"
    },
    {
      icon: Users,
      title: "Expert Interviews",
      description: "Insights from industry leaders and market experts",
      count: "24 interviews",
      color: "text-purple-600"
    },
    {
      icon: FileText,
      title: "Legal & Compliance",
      description: "Essential legal requirements and compliance guides",
      count: "18 resources",
      color: "text-red-600"
    },
    {
      icon: Play,
      title: "Video Tutorials",
      description: "Visual guides and walkthroughs for market entry",
      count: "32 videos",
      color: "text-orange-600"
    },
    {
      icon: Star,
      title: "Best Practices",
      description: "Proven strategies and methodologies for success",
      count: "15 practices",
      color: "text-yellow-600"
    }
  ];

  const featuredContent = [
    {
      id: "slack-australian-market-entry",
      title: "How Slack Entered the Australian Enterprise Market",
      category: "Success Story",
      readTime: "8 min read",
      featured: true
    },
    {
      id: "australian-business-registration-guide",
      title: "Complete Guide to Australian Business Registration",
      category: "Legal Guide",
      readTime: "12 min read",
      featured: true
    },
    {
      id: "australian-consumer-behavior",
      title: "Understanding Australian Consumer Behavior",
      category: "Market Research",
      readTime: "6 min read",
      featured: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Content Hub</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore market entry resources, case studies, and expert insights to accelerate your Australian market entry journey
          </p>
        </div>

        {/* Featured Content */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Featured Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredContent.map((content, index) => (
              <Link key={index} to={`/content/${content.id}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20 h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-primary font-medium">{content.category}</span>
                      <span className="text-xs text-muted-foreground">{content.readTime}</span>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {content.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="p-0 h-auto text-primary hover:text-primary/80">
                      Read More →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Content Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentCategories.map((category, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                      <category.icon className={`w-6 h-6 ${category.color} group-hover:text-primary`} />
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {category.title}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <span className="text-sm text-muted-foreground">{category.count}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-card border rounded-lg p-8">
          <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Start Your Journey?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Get access to exclusive content, expert guidance, and a community of successful entrepreneurs who've made Australia their new market.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              Get Started Today
            </Button>
            <Button size="lg" variant="outline">
              Browse All Content
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;
