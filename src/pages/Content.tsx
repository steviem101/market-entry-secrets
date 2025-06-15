
import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Search, TrendingUp, BookOpen, Users, FileText, Play, Star, AlertCircle } from "lucide-react";
import { useContentItems, useContentCategories } from "@/hooks/useContent";

const iconMap: Record<string, any> = {
  TrendingUp,
  BookOpen,
  Users,
  FileText,
  Play,
  Star
};

const Content = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: contentItems = [], isLoading: itemsLoading, error: itemsError } = useContentItems();
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useContentCategories();

  console.log('Content Items:', contentItems);
  console.log('Categories:', categories);
  console.log('Items Error:', itemsError);
  console.log('Categories Error:', categoriesError);

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || 
      item.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredContent = contentItems.filter(item => item.featured);

  if (itemsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there are errors
  if (itemsError || categoriesError) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Error Loading Content</h2>
            <p className="text-muted-foreground mb-6">
              {itemsError?.message || categoriesError?.message || 'Failed to load content'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Market Entry <span className="text-primary">Success Stories</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Learn from real businesses that successfully entered the Australian market. 
            Get actionable insights, proven strategies, and expert guidance.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search success stories..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Debug Info */}
        <div className="mb-4 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>Content Items Found: {contentItems.length}</p>
          <p>Categories Found: {categories.length}</p>
          <p>Featured Items: {featuredContent.length}</p>
        </div>

        {/* Categories Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="mb-2"
            >
              All Content
            </Button>
            {categories.map((category) => {
              const IconComponent = iconMap[category.icon] || BookOpen;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="mb-2"
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Featured Content */}
        {featuredContent.length > 0 && selectedCategory === null && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Success Stories</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredContent.slice(0, 2).map((content) => {
                const IconComponent = iconMap[content.content_categories?.icon] || BookOpen;
                return (
                  <Card key={content.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <IconComponent className="w-3 h-3" />
                          {content.content_categories?.name}
                        </Badge>
                        <Badge>Featured</Badge>
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-2 text-foreground">
                        {content.title}
                      </h3>
                      
                      {content.subtitle && (
                        <p className="text-muted-foreground mb-4">
                          {content.subtitle}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(content.publish_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {content.read_time} min read
                        </div>
                      </div>
                      
                      <Link to={`/content/${content.slug}`}>
                        <Button className="w-full">Read Success Story</Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* All Content Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-6">
            {selectedCategory 
              ? `${categories.find(c => c.id === selectedCategory)?.name || 'Category'} Content`
              : 'All Content'
            }
          </h2>
          
          {filteredContent.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Content Found</h3>
              <p className="text-muted-foreground mb-6">
                {contentItems.length === 0 
                  ? "No content has been added to the database yet."
                  : "No content found matching your criteria."
                }
              </p>
              {contentItems.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Content items need to be added to the database to display here.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((content) => {
                const IconComponent = iconMap[content.content_categories?.icon] || BookOpen;
                return (
                  <Card key={content.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <IconComponent className="w-3 h-3" />
                          {content.content_categories?.name}
                        </Badge>
                        {content.featured && <Badge>Featured</Badge>}
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2 text-foreground line-clamp-2">
                        {content.title}
                      </h3>
                      
                      {content.subtitle && (
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {content.subtitle}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(content.publish_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {content.read_time} min read
                        </div>
                      </div>
                      
                      <Link to={`/content/${content.slug}`}>
                        <Button variant="outline" className="w-full">
                          Read More
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Content;
