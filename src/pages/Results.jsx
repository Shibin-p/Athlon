/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useData } from "../hooks/useData";
import { ResultCard } from "../components/ResultCard";
import { Search, LayoutGrid, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

export default function Results() {
  const { events, results, teams } = useData();
  const [view, setView] = useState("cards");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");

  const completedEvents = events.filter(e => e.status === "Completed");
  const categories = ["All", ...new Set(events.map(e => e.category))];

  const filteredEvents = completedEvents.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || e.category === categoryFilter;
    
    let matchesTeam = true;
    if (teamFilter !== "All") {
      const eventResult = results.find(r => r.eventId === e.id);
      if (eventResult) {
        matchesTeam = eventResult.positions.some(pos => pos.teamId === teamFilter);
      } else {
        matchesTeam = false; // No results = team didn't score
      }
    }

    return matchesSearch && matchesCategory && matchesTeam;
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white">Event Results</h1>
          <p className="text-gray-400 mt-2 text-lg">Latest outcomes and detailed scores.</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-card border border-white/10 p-1 rounded-xl self-start">
          <button onClick={() => setView("cards")} className={cn("p-2 rounded-lg transition-colors flex items-center justify-center", view === "cards" ? "bg-white/15 text-white shadow-md" : "text-gray-500 hover:text-white")}>
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button onClick={() => setView("table")} className={cn("p-2 rounded-lg transition-colors flex items-center justify-center", view === "table" ? "bg-white/15 text-white shadow-md" : "text-gray-500 hover:text-white")}>
            <List className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search events..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#1a1a24] border border-white/20 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-white font-medium placeholder-gray-400 shadow-lg"
          />
        </div>
        
        <select 
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="md:w-48 px-4 py-3 bg-[#1a1a24] border border-white/20 rounded-xl outline-none text-white font-medium focus:border-purple-500 focus:ring-1 focus:ring-purple-500 cursor-pointer hover:bg-white/10 transition-colors shadow-lg"
        >
          {categories.map(cat => (
            <option key={cat} value={cat} className="bg-gray-900 text-white font-medium py-2">{cat} {cat === 'All' ? 'Categories' : ''}</option>
          ))}
        </select>

        <select 
          value={teamFilter}
          onChange={e => setTeamFilter(e.target.value)}
          className="md:w-48 px-4 py-3 bg-[#1a1a24] border border-white/20 rounded-xl outline-none text-white font-medium focus:border-purple-500 focus:ring-1 focus:ring-purple-500 cursor-pointer hover:bg-white/10 transition-colors shadow-lg"
        >
          <option value="All" className="bg-gray-900 text-white font-medium py-2">All Teams</option>
          {teams.map(t => (
            <option key={t.id} value={t.id} className="bg-gray-900 text-white font-medium py-2">{t.name}</option>
          ))}
        </select>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-card">
          <p className="text-xl text-gray-400">No results found applying the current filters.</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {view === "cards" ? (
            <motion.div 
              key="cards"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
            >
              {filteredEvents.map((event, index) => {
                const eventResult = results.find(r => r.eventId === event.id);
                return (
                  <motion.div key={event.id} initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -5 }}>
                    <ResultCard event={event} result={eventResult} teams={teams} />
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="overflow-x-auto rounded-2xl border border-white/10 bg-card backdrop-blur-sm shadow-xl"
            >
              <table className="w-full text-left border-collapse">
                <thead className="bg-black/60 text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-5">Event</th>
                    <th className="px-6 py-5">Category</th>
                    <th className="px-6 py-5 text-yellow-500">1st Place</th>
                    <th className="px-6 py-5 text-slate-300">2nd Place</th>
                    <th className="px-6 py-5 text-orange-400">3rd Place</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white">
                  {filteredEvents.map(event => {
                    const eventResult = results.find(r => r.eventId === event.id);
                    if (!eventResult) return null;
                    const getTeamName = (pos) => {
                      const p = eventResult.positions.find(x => x.position === pos);
                      if (!p) return "-";
                      return teams.find(t => t.id === p.teamId)?.name || "-";
                    };
                    return (
                      <tr key={event.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-5 font-semibold text-lg">{event.name}</td>
                        <td className="px-6 py-5 text-gray-400 text-sm">{event.category}</td>
                        <td className="px-6 py-5 font-bold text-yellow-400 drop-shadow-md">{getTeamName(1)}</td>
                        <td className="px-6 py-5 font-bold text-slate-300">{getTeamName(2)}</td>
                        <td className="px-6 py-5 font-bold text-orange-400">{getTeamName(3)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
