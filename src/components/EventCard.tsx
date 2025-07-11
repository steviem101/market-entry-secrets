
import { Calendar, MapPin, Users, Clock, Building, User, Eye, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BookmarkButton } from "@/components/BookmarkButton";
import { Event } from "@/hooks/useEvents";

interface EventCardProps {
  event: Event;
  onViewDetails?: (event: Event) => void;
}

export const EventCard = ({ event, onViewDetails }: EventCardProps) => {
  // Placeholder images for event organizers
  const getOrganizerImage = (index: number) => {
    const images = [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    ];
    return images[index % images.length];
  };

  const handleContactOrganizer = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const subject = encodeURIComponent(`Inquiry about ${event.title}`);
    const body = encodeURIComponent(`Hi,\n\nI'm interested in learning more about the event "${event.title}" scheduled for ${new Date(event.date).toLocaleDateString()} at ${event.time}.\n\nPlease provide more details.\n\nBest regards`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onViewDetails?.(event);
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {event.event_logo_url ? (
                <img 
                  src={event.event_logo_url} 
                  alt={`${event.title} logo`}
                  className="w-12 h-12 rounded-lg object-cover border border-border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${event.event_logo_url ? 'hidden' : ''}`}>
                <Calendar className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold line-clamp-2 mb-3 leading-tight">
                {event.title}
              </CardTitle>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-1">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>{event.time}</span>
                </div>
              </div>
            </div>
          </div>
          <BookmarkButton
            contentType="event"
            contentId={event.id}
            title={event.title}
            description={event.description}
            metadata={{
              date: event.date,
              location: event.location,
              organizer: event.organizer,
              category: event.category,
              attendees: event.attendees
            }}
            size="sm"
            variant="ghost"
            className="flex-shrink-0"
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col pt-0">
        <CardDescription className="line-clamp-3 mb-4 flex-1">
          {event.description}
        </CardDescription>
        
        <div className="flex items-center justify-between gap-2 mb-4">
          <Badge variant="secondary" className="text-xs font-medium">
            {event.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {event.type}
          </Badge>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate flex-1">{event.location}</span>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Avatar className="w-6 h-6 flex-shrink-0">
                <AvatarImage src={getOrganizerImage(parseInt(event.id) || 0)} alt={event.organizer} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  <User className="w-3 h-3" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground truncate">{event.organizer}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
              <Users className="w-4 h-4" />
              <span>{event.attendees}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleViewDetails}
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={handleContactOrganizer}
          >
            <Mail className="w-4 h-4 mr-1" />
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
