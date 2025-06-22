
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface NoDataMessageProps {
  sectorName: string;
}

const NoDataMessage = ({ sectorName }: NoDataMessageProps) => (
  <div className="text-center py-12">
    <h3 className="text-xl font-semibold mb-4">No {sectorName} Data Available</h3>
    <p className="text-muted-foreground mb-6">
      We're currently building our {sectorName} ecosystem. Check back soon for updates!
    </p>
    <Link to="/">
      <Button>Explore Other Sectors</Button>
    </Link>
  </div>
);

export default NoDataMessage;
