import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { NoIndex } from "@/components/common/NoIndex";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      {/* Not-found pages must never be indexed (MES-81 / SEO-05). Until SEO-07
          rendering lands, the response is still HTTP 200 (SPA shell); the
          noindex directive keeps these soft-404s out of the index in the
          meantime, and SEO-07 will make unknown slugs return a real 404. */}
      <NoIndex />
      <Helmet>
        <title>Page not found | Market Entry Secrets</title>
      </Helmet>
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Oops! We couldn't find the page you're looking for.
        </p>
        <Link to="/" className="text-primary hover:underline">
          Return to Home
        </Link>
      </div>
    </>
  );
};

export default NotFound;
