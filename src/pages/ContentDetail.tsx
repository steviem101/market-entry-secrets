
import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ContentDetail = () => {
  const { id } = useParams();

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

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Content Detail: {id}</CardTitle>
            <CardDescription>Detailed view of the selected content item</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This is a placeholder for the detailed content view. The content ID is: {id}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentDetail;
