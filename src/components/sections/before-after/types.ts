
export interface PainPoint {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  metric?: string;
  color: string;
}

export interface Solution {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  metric: string;
  testimonial?: string;
  link: string;
}
