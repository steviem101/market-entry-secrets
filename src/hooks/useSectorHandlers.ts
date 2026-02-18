import { toast } from "sonner";

export const useSectorHandlers = () => {
  const handleViewProfile = (item: any) => {
    if (item.website) {
      window.open(item.website, '_blank', 'noopener,noreferrer');
    } else {
      toast.info(`Profile details for ${item.name} coming soon.`);
    }
  };

  const handleContact = (item: any) => {
    if (item.contact) {
      const contact = item.contact as string;
      if (contact.includes('@')) {
        window.open(`mailto:${contact}`, '_blank');
      } else {
        window.open(contact, '_blank', 'noopener,noreferrer');
      }
    }
    toast.success(`Contact request sent to ${item.name}!`);
  };

  const handleDownload = (lead: any) => {
    if (lead.contact_email) {
      window.open(`mailto:${lead.contact_email}?subject=Lead Data Request: ${encodeURIComponent(lead.name)}`, '_blank');
    }
    toast.success(`Download request submitted for ${lead.name}.`);
  };

  const handlePreview = (lead: any) => {
    if (lead.preview_url) {
      window.open(lead.preview_url, '_blank', 'noopener,noreferrer');
    } else {
      toast.info(`Preview for ${lead.name} is not yet available.`);
    }
  };

  return {
    handleViewProfile,
    handleContact,
    handleDownload,
    handlePreview
  };
};
