
import { ReactNode } from "react";
import Navigation from "./Navigation";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
  <div className="min-h-screen bg-background">
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:border-border focus:rounded-lg focus:shadow-lg"
    >
      Skip to content
    </a>
    <Navigation />
    <main id="main-content">{children}</main>
    <Footer />
  </div>
);

export default Layout;
