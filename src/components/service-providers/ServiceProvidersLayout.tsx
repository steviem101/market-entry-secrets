
import { ReactNode } from "react";

interface ServiceProvidersLayoutProps {
  filters: ReactNode;
  content: ReactNode;
}

export const ServiceProvidersLayout = ({
  filters,
  content
}: ServiceProvidersLayoutProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {filters}
        <main className="flex-1">
          {content}
        </main>
      </div>
    </div>
  );
};
