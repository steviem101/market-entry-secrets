
import { SearchResult } from "@/hooks/useMasterSearch";
import { Calendar, Users, FileText, Briefcase, Lightbulb, Database, Wrench } from "lucide-react";

export const getTypeIcon = (result: SearchResult) => {
  // Check if this is actually a trade agency based on metadata
  if (result.metadata?.originalType === 'trade_agency') {
    return <Briefcase className="w-4 h-4" />;
  }
  
  switch (result.type) {
    case 'event':
      return <Calendar className="w-4 h-4" />;
    case 'community_member':
      return <Users className="w-4 h-4" />;
    case 'content':
      return <FileText className="w-4 h-4" />;
    case 'service_provider':
      return <Wrench className="w-4 h-4" />;
    case 'innovation_hub':
      return <Lightbulb className="w-4 h-4" />;
    case 'lead':
      return <Database className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

export const getTypeBadgeVariant = (result: SearchResult): "default" | "secondary" | "destructive" | "outline" => {
  // Check if this is actually a trade agency based on metadata
  if (result.metadata?.originalType === 'trade_agency') {
    return 'destructive';
  }
  
  switch (result.type) {
    case 'event':
      return 'default';
    case 'community_member':
      return 'secondary';
    case 'content':
      return 'outline';
    case 'service_provider':
      return 'default';
    case 'innovation_hub':
      return 'secondary';
    case 'lead':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const getTypeLabel = (result: SearchResult) => {
  // Check if this is actually a trade agency based on metadata
  if (result.metadata?.originalType === 'trade_agency') {
    return 'trade agency';
  }
  
  switch (result.type) {
    case 'community_member':
      return 'mentor';
    case 'service_provider':
      return 'service provider';
    case 'innovation_hub':
      return 'innovation hub';
    default:
      return result.type.replace('_', ' ');
  }
};
