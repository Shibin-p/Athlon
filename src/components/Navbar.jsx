import { NavLink } from "react-router-dom";
import { Trophy } from "lucide-react";
import { cn } from "../lib/utils";

export function Navbar() {
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
            <span style={{ fontFamily: "'Orbitron', sans-serif" }} className="text-2xl font-black italic tracking-widest drop-shadow-[0_2px_10px_rgba(139,92,246,0.3)] flex items-baseline">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">
                ATHLON
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                '26
              </span>
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
        </div>
      </div>
    </nav>
  );
}
