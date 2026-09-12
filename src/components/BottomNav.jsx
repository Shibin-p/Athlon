import { NavLink } from "react-router-dom";
import { LayoutDashboard, Trophy, Medal, CalendarDays } from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
  { name: "Dashboard", path: "/",       icon: LayoutDashboard },
  { name: "Scores",    path: "/scores",  icon: Trophy          },
  { name: "Results",   path: "/results", icon: Medal           },
  { name: "Events",    path: "/events",  icon: CalendarDays    },
];

export function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/10 flex items-stretch">
        {navItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={name}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-all duration-200 relative",
                isActive
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-300"
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator pill at top */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400" />
                )}

                <span
                  className={cn(
                    "p-1.5 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-br from-purple-500/20 to-indigo-500/20 shadow-[0_0_10px_rgba(139,92,246,0.25)]"
                      : ""
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-all duration-200",
                      isActive
                        ? "text-transparent stroke-[url(#nav-grad)]"
                        : "text-gray-500"
                    )}
                    style={
                      isActive
                        ? {
                            stroke: "url(#nav-grad)",
                          }
                        : undefined
                    }
                  />
                  {/* SVG gradient definition — rendered once globally, reused by all icons */}
                  <svg width="0" height="0" className="absolute">
                    <defs>
                      <linearGradient id="nav-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#c084fc" />
                        <stop offset="100%" stopColor="#818cf8" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>

                <span
                  className={cn(
                    "transition-all duration-200",
                    isActive
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 font-semibold"
                      : ""
                  )}
                >
                  {name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
