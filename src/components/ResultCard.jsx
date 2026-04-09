import { Medal } from "lucide-react";
import { cn } from "../lib/utils";

export function ResultCard({ event, result, teams }) {
  if (!event || !result) return null;

  // map positions to actual team data
  const positions = result.positions.map(pos => ({
    ...pos,
    team: teams.find(t => t.id === pos.teamId)
  })).sort((a, b) => a.position - b.position);

  const getMedalColor = (pos) => {
    switch(pos) {
      case 1: return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case 2: return "text-slate-300 bg-slate-300/10 border-slate-300/20";
      case 3: return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-cardBorder bg-card backdrop-blur-sm shadow-xl">
      <div className="mb-5 border-b border-white/5 pb-4">
        <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
        <p className="text-sm text-gray-400 font-medium">{event.category} • {new Date(event.date).toLocaleDateString()}</p>
      </div>

      <div className="space-y-3">
        {positions.map((item) => (
          <div key={item.teamId} className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5 group hover:border-white/10 transition-colors">
            <div className="flex items-center gap-4">
              <div className={cn("flex items-center justify-center w-8 h-8 rounded-full border shadow-inner", getMedalColor(item.position))}>
                {item.position <= 3 ? <Medal className="w-4 h-4" /> : <span className="text-xs font-bold">{item.position}</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border", item.team?.bgColor, item.team?.color, item.team?.border)}>
                  {item.team?.logo}
                </span>
                <span className="font-semibold text-gray-200">{item.team?.name}</span>
              </div>
            </div>
            
            <div className="text-right min-w-[3rem]">
              <span className="text-lg font-bold text-white">+{item.points}</span>
              <span className="text-xs text-gray-500 ml-1 uppercase">pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
