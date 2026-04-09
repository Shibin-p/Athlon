import { NavLink } from "react-router-dom";
import { Trophy, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Dashboard", path: "/" },
    { name: "Scores", path: "/scores" },
    { name: "Results", path: "/results" },
    { name: "Events", path: "/events" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#05050A]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <NavLink to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.4)] group-hover:scale-105 transition-transform duration-300">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <span style={{ fontFamily: "'Orbitron', sans-serif" }} className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 tracking-widest drop-shadow-[0_2px_10px_rgba(139,92,246,0.3)]">
              ATHLON
            </span>
          </NavLink>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-2">
            {links.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-white/10 text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                  )
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white focus:outline-none p-2 rounded-lg hover:bg-white/5"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div
        className={cn(
          "md:hidden absolute w-full bg-[#0a0a0f]/95 backdrop-blur-lg border-b border-white/5 overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-64 border-b" : "max-h-0 border-transparent"
        )}
      >
        <div className="px-4 pt-2 pb-4 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                cn(
                  "block px-4 py-3 rounded-lg text-base font-medium transition-colors",
                  isActive
                    ? "bg-white/10 text-white border border-white/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                )
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
