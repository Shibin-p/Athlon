import { Trophy, Medal } from "lucide-react";
import { cn } from "../lib/utils";

export function LeaderboardCard({ team, rank }) {
  const isTop3 = rank <= 3;
  
  return (
    <div className={cn(
      "relative p-5 rounded-2xl border bg-card backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]",
      team.border || "border-white/10",
      isTop3 ? "shadow-[0_4px_20px_rgba(0,0,0,0.3)]" : "shadow-none"
    )}>
      {rank === 1 && (
        <div className="absolute -top-4 -right-4 bg-yellow-500/20 text-yellow-400 p-2 rounded-full border border-yellow-500/30">
          <Trophy className="w-5 h-5" />
        </div>
      )}
      
      <div className="flex items-center gap-4 cursor-default">
        <div className="flex flex-col items-center justify-center w-12 h-12 bg-black/40 rounded-xl border border-white/5">
          <span className="text-xl font-bold text-white/80">#{rank}</span>
        </div>
        
        {team.logo ? (
          <div className={cn("w-14 h-14 rounded-full flex flex-shrink-0 items-center justify-center text-xl font-bold", team.bgColor, team.color)}>
             {team.logo}
          </div>
        ) : null}
        
        <div className="flex-grow min-w-0">
          <h3 className="text-xl font-bold text-white tracking-wide truncate">{team.name}</h3>
          <p className="text-sm text-gray-400">Total Score</p>
        </div>
        
        <div className="text-right flex-shrink-0">
          <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-500">
            {team.totalPoints}
          </div>
          <span className="text-xs uppercase tracking-wider text-primary">Pts</span>
        </div>
      </div>
    </div>
  );
}
