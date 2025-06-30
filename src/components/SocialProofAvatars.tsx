
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface SocialProofAvatarsProps {
  className?: string;
}

export const SocialProofAvatars = ({ className = "" }: SocialProofAvatarsProps) => {
  // Using placeholder.pics service for consistent professional headshots
  const avatars = [
    {
      src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      alt: "User testimonial",
      fallback: "JD"
    },
    {
      src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop&crop=face",
      alt: "User testimonial", 
      fallback: "SM"
    },
    {
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      alt: "User testimonial",
      fallback: "AL"
    },
    {
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      alt: "User testimonial",
      fallback: "MJ"
    },
    {
      src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      alt: "User testimonial",
      fallback: "RK"
    },
    {
      src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
      alt: "User testimonial",
      fallback: "LT"
    }
  ];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex -space-x-3">
        {avatars.map((avatar, index) => (
          <Avatar 
            key={index}
            className="w-12 h-12 border-3 border-white shadow-lg hover:scale-110 hover:z-10 transition-all duration-200 cursor-pointer"
            style={{ zIndex: avatars.length - index }}
          >
            <AvatarImage 
              src={avatar.src} 
              alt={avatar.alt}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-accent/80 text-white text-sm font-semibold">
              {avatar.fallback}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
    </div>
  );
};
