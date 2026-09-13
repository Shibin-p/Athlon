import { useState, useRef, useEffect } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";

// Branded SVG icons
const Icons = {
  instagram: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#ig-grad)" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="4" stroke="url(#ig-grad)" strokeWidth="2" fill="none" />
      <circle cx="17.5" cy="6.5" r="1" fill="#dc2743" />
    </svg>
  ),
  whatsapp: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#25D366">
      <path d="M12 2C6.478 2 2 6.478 2 12c0 1.77.463 3.43 1.27 4.875L2 22l5.293-1.252A9.955 9.955 0 0012 22c5.522 0 10-4.478 10-10S17.522 2 12 2zm4.87 13.88c-.207.58-1.21 1.11-1.665 1.18-.43.064-.97.09-1.566-.098-.36-.115-.82-.268-1.41-.524-2.478-1.07-4.098-3.55-4.222-3.716-.124-.166-1.012-1.344-1.012-2.564 0-1.22.64-1.818.866-2.065.227-.247.495-.31.66-.31.166 0 .33.002.474.01.152.008.356-.058.557.425.207.5.703 1.72.765 1.845.062.124.103.27.02.434-.083.165-.124.268-.248.414-.124.145-.26.325-.372.437-.124.123-.254.257-.11.504.145.247.643 1.06 1.38 1.717.948.845 1.747 1.106 1.994 1.23.247.124.392.103.537-.062.145-.165.62-.723.786-.97.165-.248.33-.206.557-.124.227.083 1.44.68 1.687.804.247.124.413.186.474.29.062.103.062.596-.145 1.176z" />
    </svg>
  ),
  email: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="#6366f1" strokeWidth="2" fill="none" />
      <path d="M2 8l10 6 10-6" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  globe: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2" />
      <path d="M2 12h20M12 2c-2.5 3-4 6.5-4 10s1.5 7 4 10M12 2c2.5 3 4 6.5 4 10s-1.5 7-4 10" stroke="#3b82f6" strokeWidth="2" />
    </svg>
  ),
};

const ICON_MAP = {
  WhatsApp: Icons.whatsapp,
  Instagram: Icons.instagram,
  "E-mail": Icons.email,
  Website: Icons.globe,
};

function Dropdown({ label, links, highlight }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1 font-semibold focus:outline-none transition-opacity hover:opacity-80 ${highlight ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400" : "text-gray-400 hover:text-white"}`}
      >
        <span>{label}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-300 ${isOpen ? "rotate-180" : ""} ${highlight ? "text-indigo-400" : "text-gray-400"}`}
        />
      </button>

      {/* Dropdown Panel with smooth animation */}
      <div
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 bg-[#0d0d14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 transition-all duration-300 origin-bottom ${isOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 translate-y-2 pointer-events-none"
          }`}
      >
        <div className="py-2 flex flex-col">
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <span className="flex-shrink-0">{ICON_MAP[link.name] || Icons.globe}</span>
              <span className="flex-1">{link.name}</span>
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  const ekctcLinks = [
    { name: "Instagram", url: "https://instagram.com/eranadknowledgecity_official" },
    { name: "Website", url: "https://ekctc.edu.in/" },
  ];

  return (
    <footer className="mt-8 py-5 pb-24 md:pb-5 border-t border-white/5 bg-black/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center space-y-2">
        <div className="text-gray-500 text-xs tracking-wide flex items-center justify-center gap-1">
          &copy; ATHLON'26 | <Dropdown label="EKCTC" links={ekctcLinks} />
        </div>
        <div className="text-gray-500 text-xs flex items-center justify-center gap-1">
          Powered by{" "}
          <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
            Zicago
          </span>
        </div>
      </div>
    </footer>
  );
}

