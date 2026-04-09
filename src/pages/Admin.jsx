/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../hooks/useData";
import { Lock, Plus, Trash2, List as ListIcon, Save, X, Edit, Users, Trophy, LogOut } from "lucide-react";
import { cn } from "../lib/utils";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Admin() {
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("events");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setLoadingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    signOut(auth);
  };

  const {
    events, teams, results, isLoaded,
    addEvent, updateEvent, deleteEvent,
    addTeam, updateTeam, deleteTeam,
    addResult, updateResult, deleteResult
  } = useData();

  if (!isLoaded || loadingAuth) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
            Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-3 text-lg">Manage events, teams, and tournament results.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-red-500/20 text-white rounded-xl border border-white/10 hover:border-red-500/50 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </header>

      <div className="flex p-1 bg-card backdrop-blur-md rounded-xl max-w-lg w-full border border-white/10">
        {[
          { id: "events", label: "Events", icon: ListIcon },
          { id: "teams", label: "Teams", icon: Users },
          { id: "results", label: "Results", icon: Trophy }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all duration-300",
              activeTab === tab.id
                ? "bg-white/15 text-white shadow-md border border-white/10"
                : "text-gray-400 hover:text-white"
            )}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-card backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 min-h-[500px]">
        {activeTab === "events" && <EventsManager events={events} addEvent={addEvent} updateEvent={updateEvent} deleteEvent={deleteEvent} />}
        {activeTab === "teams" && <TeamsManager teams={teams} addTeam={addTeam} updateTeam={updateTeam} deleteTeam={deleteTeam} />}
        {activeTab === "results" && <ResultsManager results={results} events={events} teams={teams} addResult={addResult} updateResult={updateResult} deleteResult={deleteResult} />}
      </div>
    </div>
  );
}

// --- Managers ---

function EventsManager({ events, addEvent, updateEvent, deleteEvent }) {
  const [form, setForm] = useState({ name: "", category: "Athletics", venue: "", date: "", status: "Upcoming" });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    addEvent({ id: "e" + Date.now(), ...form });
    setForm({ name: "", category: "Athletics", venue: "", date: "", status: "Upcoming" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Add New Event</h2>
        <form onSubmit={submit} className="space-y-4">
          <input className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-red-500" placeholder="Event Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <select className="bg-black/40 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-red-500" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="Athletics">Athletics</option>
              <option value="Games">Games</option>
            </select>
            <input type="date" className="bg-black/40 border border-white/10 p-3 rounded-lg text-gray-300 outline-none focus:border-red-500" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
          </div>
          <input className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-red-500" placeholder="Venue" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} required />
          <button type="submit" className="flex items-center justify-center w-full bg-white/10 hover:bg-white/20 text-white font-bold p-3 rounded-lg transition-colors gap-2"><Plus className="w-4 h-4" /> Add Event</button>
        </form>
      </div>
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Manage Events</h2>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {events.map(ev => (
            <div key={ev.id} className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-white">{ev.name}</p>
                <div className="text-xs text-gray-500 mt-1 space-x-2 flex items-center">
                  <span className={cn("px-2 py-0.5 rounded", ev.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400')}>{ev.status}</span>
                  <span>{ev.category}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateEvent({ ...ev, status: ev.status === "Upcoming" ? "Completed" : "Upcoming" })} className="p-2 bg-white/5 hover:bg-white/10 rounded-md text-white text-xs">{ev.status === "Upcoming" ? "Mark Done" : "Mark Upcom"}</button>
                <button onClick={() => { if (confirm("Delete event?")) deleteEvent(ev.id) }} className="p-2 bg-red-500/10 hover:bg-red-500/30 text-red-500 rounded-md"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamsManager({ teams, addTeam, updateTeam, deleteTeam }) {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!name) return;
    addTeam({
      id: "t" + Date.now(),
      name,
      logo: logo || "",
      totalPoints: 0,
      color: "text-gray-300",
      bgColor: "bg-white/10",
      border: "border-white/20"
    });
    setName(""); setLogo("");
  };

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Add Team</h2>
        <form onSubmit={submit} className="space-y-4">
          <input className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-white outline-none" placeholder="Team Name" value={name} onChange={e => setName(e.target.value)} required />
          <input className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-white outline-none" placeholder="Logo (Text/Emoji)" value={logo} onChange={e => setLogo(e.target.value)} />
          <button type="submit" className="w-full bg-white/10 hover:bg-white/20 text-white font-bold p-3 rounded-lg transition-colors">Add Team</button>
        </form>
      </div>
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Existing Teams</h2>
        <div className="space-y-3">
          {teams.map(t => (
            <div key={t.id} className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                {t.logo ? <div className={cn("w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center font-bold", t.bgColor, t.color)}>{t.logo}</div> : null}
                <span className="font-bold text-white truncate max-w-[200px]">{t.name}</span>
              </div>
              <button onClick={() => { if (confirm("Delete team?")) deleteTeam(t.id) }} className="p-2 bg-red-500/10 hover:bg-red-500/30 text-red-500 rounded-md"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultsManager({ results, events, teams, addResult, updateResult, deleteResult }) {
  const completedEvents = events.filter(e => e.status === "Completed");
  const [form, setForm] = useState({
    eventId: "",
    p1Team: "", p1Pts: 15,
    p2Team: "", p2Pts: 10,
    p3Team: "", p3Pts: 5,
  });

  const submit = (e) => {
    e.preventDefault();
    if (!form.eventId || !form.p1Team || !form.p2Team || !form.p3Team) return alert("Fill required fields");
    if (results.find(r => r.eventId === form.eventId)) return alert("Result already exists. Edit or delete it.");

    addResult({
      id: "r" + Date.now(),
      eventId: form.eventId,
      positions: [
        { teamId: form.p1Team, position: 1, points: Number(form.p1Pts) },
        { teamId: form.p2Team, position: 2, points: Number(form.p2Pts) },
        { teamId: form.p3Team, position: 3, points: Number(form.p3Pts) },
      ]
    });
    setForm({ ...form, eventId: "" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Add Result to Event</h2>
        <form onSubmit={submit} className="space-y-4">
          <select className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-white outline-none" value={form.eventId} onChange={e => setForm({ ...form, eventId: e.target.value })} required>
            <option value="">-- Select Completed Event --</option>
            {completedEvents.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>

          <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3">
            {[1, 2, 3].map(pos => (
              <div key={pos} className="flex gap-2 items-center">
                <span className="w-6 text-gray-400 font-bold">{pos}st</span>
                <select className="flex-1 bg-black/40 border border-white/10 p-2 rounded text-white" value={form[`p${pos}Team`]} onChange={e => setForm({ ...form, [`p${pos}Team`]: e.target.value })} required>
                  <option value="">Team...</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <input type="number" className="w-16 bg-black/40 border border-white/10 p-2 rounded text-white text-center" value={form[`p${pos}Pts`]} onChange={e => setForm({ ...form, [`p${pos}Pts`]: e.target.value })} /> pts
              </div>
            ))}
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-purple-600 text-white font-bold p-3 rounded-lg transition-colors">Save Results</button>
        </form>
      </div>
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Existing Results</h2>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {results.map(r => {
            const ev = events.find(e => e.id === r.eventId);
            if (!ev) return null;
            return (
              <div key={r.id} className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-white mb-2">{ev.name}</p>
                  <div className="text-xs text-gray-400 space-y-1">
                    {r.positions.sort((a, b) => a.position - b.position).map(p => {
                      const t = teams.find(tm => tm.id === p.teamId);
                      return <div key={p.position}>{p.position}. {t?.name} (+{p.points})</div>
                    })}
                  </div>
                </div>
                <button onClick={() => { if (confirm("Delete result?")) deleteResult(r.id) }} className="p-2 bg-red-500/10 hover:bg-red-500/30 text-red-500 rounded-md"><Trash2 className="w-4 h-4" /></button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
