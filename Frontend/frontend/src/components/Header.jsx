import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="w-full bg-[#f7efef] border-b border-[#d3b482]/40 font-serif sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo / Brand Name */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-normal tracking-wider text-[#6d4c5d]">
            Safe<span className="text-[#d3b482] font-semibold">Her</span>
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-sans text-xs uppercase tracking-[0.2em]">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`transition-colors duration-200 hover:text-[#d3b482] ${
                isActive(link.path)
                  ? "text-[#6d4c5d] font-bold border-b-2 border-[#d3b482] pb-1"
                  : "text-[#6d4c5d]/80"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action Buttons (Login / Sign Up) */}
        <div className="flex items-center gap-3 font-sans text-xs uppercase tracking-wider">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-full text-[#6d4c5d] hover:text-[#d3b482] transition-colors duration-200 font-semibold"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-6 py-2.5 rounded-full bg-[#916b7d] hover:bg-[#7e5b6c] text-white border border-[#d3b482]/50 shadow-sm transition-all duration-200 hover:scale-[1.02] font-semibold"
          >
            Sign Up
          </Link>
        </div>

      </div>
    </header>
  );
}