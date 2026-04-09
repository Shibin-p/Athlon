import { useData } from "../hooks/useData";
import { LeaderboardCard } from "../components/LeaderboardCard";
import { Activity, Flag, CheckCircle } from "lucide-react";

export default function Home() {
  const { events, calculateLeaderboard } = useData();
  const leaderboard = calculateLeaderboard();
  
  const completedEvents = events.filter(e => e.status === "Completed").length;
  const upcomingEvents = events.filter(e => e.status === "Upcoming").length;
  const totalEvents = events.length;

  return (
    <div className="space-y-10">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-100 to-gray-500">
          Championship <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Hub</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl">
          Live updates and standings across all college athletic tournament events.
        </p>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-white/5 bg-card backdrop-blur-md flex items-center gap-5 shadow-xl">
          <div className="p-4 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Total Events</p>
            <p className="text-3xl font-bold text-white">{totalEvents}</p>
          </div>
        </div>
        <div className="p-6 rounded-2xl border border-white/5 bg-card backdrop-blur-md flex items-center gap-5 shadow-xl">
          <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Completed</p>
            <p className="text-3xl font-bold text-white">{completedEvents}</p>
          </div>
        </div>
        <div className="p-6 rounded-2xl border border-white/5 bg-card backdrop-blur-md flex items-center gap-5 shadow-xl">
          <div className="p-4 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Flag className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Upcoming</p>
            <p className="text-3xl font-bold text-white">{upcomingEvents}</p>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="w-1.5 h-8 rounded-full bg-primary inline-block"></span>
            Overall Leaderboard
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {leaderboard.map((team, index) => (
            <div key={team.id}>
              <LeaderboardCard team={team} rank={index + 1} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
