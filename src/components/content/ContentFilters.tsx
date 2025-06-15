
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, any> = {
  TrendingUp: () => import("lucide-react").then(mod => mod.TrendingUp),
  BookOpen,
  Users: () => import("lucide-react").then(mod => mod.Users),
  FileText: () => import("lucide-react").then(mod => mod.FileText),
  Play: () => import("lucide-react").then(mod => mod.Play),
  Star: () => import("lucide-react").then(mod => mod.Star)
};

interface ContentFiltersProps {
  categories: any[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export const ContentFilters = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: ContentFiltersProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Browse by Category</h2>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => onCategoryChange(null)}
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
              onClick={() => onCategoryChange(category.id)}
              className="mb-2"
            >
              <IconComponent className="w-4 h-4 mr-2" />
              {category.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
