
import { ReactNode } from "react";
import Navigation from "./Navigation";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
  <div className="min-h-screen bg-background">
    <Navigation />
    <main>{children}</main>
    <Footer />
  </div>
);

export default Layout;
