
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Content = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Content Hub</h1>
          <p className="text-lg text-muted-foreground">
            Explore market entry resources, case studies, and expert insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Studies</CardTitle>
              <CardDescription>Real market entry success and failure stories</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Learn from other businesses' experiences entering the Australian market.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guides & Resources</CardTitle>
              <CardDescription>Step-by-step market entry guides</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Comprehensive guides covering legal, regulatory, and strategic aspects.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expert Insights</CardTitle>
              <CardDescription>Industry expert perspectives and advice</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Get insights from professionals who've helped businesses succeed in Australia.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Content;
