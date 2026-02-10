import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center px-4">
        <p className="text-gold text-6xl font-light mb-4">404</p>
        <h1 className="text-xl font-light text-white mb-2 tracking-wide">Page Not Found</h1>
        <p className="text-sm text-white/40 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="inline-flex px-6 py-2.5 bg-gold text-black text-sm font-medium rounded hover:bg-gold/90 transition">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
