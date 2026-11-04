import { ArrowUpRight } from "lucide-react";
import Brand from "./Brand";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer section-container">
      <div>
        <Brand />
        <p>A little space for your big ideas.</p>
      </div>
      <div className="footer-links">
        <a href="#features">The good stuff</a>
        <a href="#questions">Questions?</a>
        <Link to="/signup">
          Make yourself at home <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Second Brain</span>
        <span>
          Made for a more curious life. <span className="footer-star">✳</span>
        </span>
      </div>
    </footer>
  );
}
