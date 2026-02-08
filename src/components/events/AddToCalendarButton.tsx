import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AddToCalendarButtonProps {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  size?: "sm" | "default" | "lg";
}

export const AddToCalendarButton = ({
  title,
  description,
  date,
  time,
  location,
  size = "sm",
}: AddToCalendarButtonProps) => {
  const formatDateForGoogle = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const formatDateForICS = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const handleGoogleCalendar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startDate = formatDateForGoogle(date);
    // Assume 8 hour event
    const endDate = formatDateForGoogle(
      new Date(new Date(date).getTime() + 8 * 60 * 60 * 1000).toISOString()
    );
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
    window.open(url, "_blank");
  };

  const handleDownloadICS = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startDate = formatDateForICS(date);
    const endDate = formatDateForICS(
      new Date(new Date(date).getTime() + 8 * 60 * 60 * 1000).toISOString()
    );

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Market Entry Secrets//EN",
      "BEGIN:VEVENT",
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
      `LOCATION:${location}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} onClick={(e) => e.stopPropagation()}>
          <CalendarPlus className="w-4 h-4 mr-1" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleGoogleCalendar}>
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadICS}>
          Download .ics (Outlook/Apple)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
