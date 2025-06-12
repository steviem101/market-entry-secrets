
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Filter, Search, Plus } from "lucide-react";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  category: string;
  attendees: number;
  description: string;
  organizer: string;
}

interface EventFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  events: Event[];
}

const EventFilters = ({ categories, selectedCategory, onCategoryChange, events }: EventFiltersProps) => {
  return (
    <>
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-foreground">Events</h3>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <CalendarDays className="w-4 h-4 mr-2" />
            Calendar View
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            List View
          </Button>
          <Button variant="outline" size="sm">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Submit Event
          </Button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-6">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category)}
            className="rounded-full"
          >
            {category}
            {category !== "All" && (
              <Badge variant="secondary" className="ml-2">
                {events.filter(e => e.category === category).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Location Filters */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <Badge variant="outline">Sydney 8</Badge>
        <Badge variant="outline">Melbourne 6</Badge>
        <Badge variant="outline">Brisbane 4</Badge>
        <Badge variant="outline">Perth 3</Badge>
        <Badge variant="outline">Adelaide 2</Badge>
        <Badge variant="outline">Canberra 1</Badge>
        <Badge variant="outline">+2</Badge>
      </div>
    </>
  );
};

export default EventFilters;
