
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const SectorsCallToAction = () => {
  return (
    <div className="text-center mt-20 py-16 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl">
      <h2 className="text-3xl font-bold mb-4">Don't see your sector?</h2>
      <p className="text-muted-foreground mb-8 text-lg max-w-2xl mx-auto">
        We're continuously expanding our sector coverage. Contact us to discuss your specific industry needs.
      </p>
      <Link to="/contact">
        <Button size="lg" className="px-8">Get in Touch</Button>
      </Link>
    </div>
  );
};

export default SectorsCallToAction;
