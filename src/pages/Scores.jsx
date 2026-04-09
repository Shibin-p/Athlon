import { useData } from "../hooks/useData";
import { LeaderboardCard } from "../components/LeaderboardCard";
import { Trophy, Activity, Medal } from "lucide-react";
import { cn } from "../lib/utils";

export default function Scores() {
  const { calculateLeaderboard, events, results, isLoaded } = useData();
  const leaderboard = calculateLeaderboard();

  if (!isLoaded) return null;

  return (
    <div className="space-y-12">
      <header className="text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black text-white flex items-center justify-center md:justify-start gap-4 uppercase tracking-tight">
          <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/30">
            <Trophy className="w-8 h-8 text-purple-400" />
          </div>
          Live Standings
        </h1>
        <p className="text-gray-400 mt-3 text-lg">Detailed breakdown of team scores across all events.</p>
      </header>

      {/* Main Leaderboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {leaderboard.map((team, index) => (
          <div key={team.id} className="col-span-1">
             <LeaderboardCard team={team} rank={index + 1} />
          </div>
        ))}
      </div>

      {/* Event Breakdown */}
      <div className="pt-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Activity className="w-6 h-6 text-primary" />
          Score Breakdown by Event
        </h2>
        
        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-card backdrop-blur-xl shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0a0a0f] text-gray-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-5 w-1/3">Completed Event</th>
                {leaderboard.map(team => (
                  <th key={team.id} className="px-6 py-5 text-center min-w-[100px]">
                    <span className={cn("px-3 py-1.5 rounded-lg text-sm font-bold border border-white/5 shadow-inner inline-flex items-center gap-2", team.bgColor, team.color)}>
                      {team.logo ? <span className="flex-shrink-0">{team.logo}</span> : null}
                      <span className="truncate">{team.name}</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white bg-black/20">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={leaderboard.length + 1} className="px-6 py-10 text-center text-gray-400 text-lg">
                    No results available yet.
                  </td>
                </tr>
              ) : (
                results.map(result => {
                  const event = events.find(e => e.id === result.eventId);
                  if (!event) return null;
                  
                  return (
                    <tr key={result.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="font-semibold text-gray-200 group-hover:text-white transition-colors">
                           {event.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{event.category}</div>
                      </td>
                      {leaderboard.map(team => {
                        const scoreData = result.positions.find(p => p.teamId === team.id);
                        return (
                          <td key={team.id} className="px-6 py-5 text-center">
                            {scoreData ? (
                              <span className="text-white font-bold bg-white/5 px-3 py-1 rounded-md border border-white/5 inline-block min-w-[3rem]">
                                +{scoreData.points}
                              </span>
                            ) : (
                              <span className="text-gray-600">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
            <tfoot className="bg-[#05050A] text-white border-t border-white/10 shadow-inner">
               <tr>
                 <td className="px-6 py-6 text-right text-gray-400 uppercase tracking-widest text-sm font-bold">Total Points</td>
                 {leaderboard.map(team => (
                   <td key={team.id} className="px-6 py-6 text-center text-2xl font-black text-transparent bg-clip-text bg-gradient-to-t from-gray-400 to-white">
                     {team.totalPoints}
                   </td>
                 ))}
               </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
