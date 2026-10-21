/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../hooks/useData";
import { Lock, Plus, Trash2, List as ListIcon, Save, X, Edit, Users, Trophy, LogOut, MinusCircle, RotateCcw, RefreshCw, History, AlertTriangle, CheckCircle2 } from "lucide-react";
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
    events, teams, results, penalties, isLoaded,
    addEvent, updateEvent, deleteEvent,
    addTeam, updateTeam, deleteTeam,
    addResult, updateResult, deleteResult,
    addPenalty, updatePenalty, reversePenalty, reactivatePenalty
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
          <p className="text-gray-400 mt-3 text-lg">Manage events, teams, tournament results, and penalties.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-red-500/20 text-white rounded-xl border border-white/10 hover:border-red-500/50 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </header>

      <div className="flex p-1 bg-card backdrop-blur-md rounded-xl max-w-2xl w-full border border-white/10 overflow-x-auto">
        {[
          { id: "events", label: "Events", icon: ListIcon },
          { id: "teams", label: "Teams", icon: Users },
          { id: "results", label: "Results", icon: Trophy },
          { id: "penalties", label: "Minus Points", icon: MinusCircle }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all duration-300 min-w-[110px]",
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
        {activeTab === "penalties" && (
          <PenaltiesManager
            penalties={penalties}
            teams={teams}
            addPenalty={addPenalty}
            updatePenalty={updatePenalty}
            reversePenalty={reversePenalty}
            reactivatePenalty={reactivatePenalty}
          />
        )}
      </div>
    </div>
  );
}

// --- Shared input style ---
const inputCls = "w-full bg-black/40 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-purple-500 transition-colors";
const selectCls = "bg-black/40 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-purple-500 transition-colors";

// ─────────────────────────────────────────────
//  EVENTS MANAGER
// ─────────────────────────────────────────────
const BLANK_EVENT = { name: "", category: "Athletics", venue: "", date: "", status: "Upcoming" };

function EventsManager({ events, addEvent, updateEvent, deleteEvent }) {
  const [form, setForm] = useState(BLANK_EVENT);
  const [editingId, setEditingId] = useState(null); // null = add mode
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null); // { text, ok }

  const flash = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  const startEdit = (ev) => {
    setEditingId(ev.id);
    setForm({ name: ev.name, category: ev.category, venue: ev.venue, date: ev.date, status: ev.status });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(BLANK_EVENT);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.venue || !form.date) return flash("Please fill in all required fields.", false);
    setSaving(true);
    try {
      if (editingId) {
        await updateEvent({ id: editingId, ...form });
        flash("Event updated successfully.");
        cancelEdit();
      } else {
        await addEvent({ id: "e" + Date.now(), ...form });
        flash("Event added successfully.");
        setForm(BLANK_EVENT);
      }
    } catch (err) {
      flash("Error saving event: " + err.message, false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      {/* Form */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            {editingId ? "✏️ Edit Event" : "Add New Event"}
          </h2>
          {editingId && (
            <button onClick={cancelEdit} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          )}
        </div>

        {msg && (
          <div className={cn("mb-4 px-4 py-2.5 rounded-lg text-sm font-medium", msg.ok ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30")}>
            {msg.text}
          </div>
        )}

        {editingId && (
          <div className="mb-4 px-4 py-2.5 rounded-lg text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20">
            Editing existing event — changes will update the record directly.
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <input className={inputCls} placeholder="Event Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <select className={selectCls} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="Athletics">Athletics</option>
              <option value="Games">Games</option>
            </select>
            <input type="date" className={cn(selectCls, "text-gray-300")} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
          </div>
          <input className={inputCls} placeholder="Venue *" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} required />
          <select className={cn(selectCls, "w-full")} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
          </select>
          <button
            type="submit"
            disabled={saving}
            className={cn(
              "flex items-center justify-center w-full font-bold p-3 rounded-lg transition-colors gap-2",
              editingId
                ? "bg-purple-600 hover:bg-purple-500 text-white"
                : "bg-white/10 hover:bg-white/20 text-white"
            )}
          >
            {saving ? "Saving…" : editingId ? <><Save className="w-4 h-4" /> Save Changes</> : <><Plus className="w-4 h-4" /> Add Event</>}
          </button>
        </form>
      </div>

      {/* List */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Manage Events</h2>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {events.map(ev => (
            <div key={ev.id} className={cn("p-4 bg-black/40 border rounded-xl flex items-center justify-between transition-all", editingId === ev.id ? "border-purple-500/50 bg-purple-500/5" : "border-white/5")}>
              <div className="min-w-0 flex-1 mr-3">
                <p className="font-bold text-white truncate">{ev.name}</p>
                <div className="text-xs text-gray-500 mt-1 space-x-2 flex flex-wrap gap-y-1 items-center">
                  <span className={cn("px-2 py-0.5 rounded", ev.status === "Completed" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400")}>{ev.status}</span>
                  <span>{ev.category}</span>
                  {ev.venue && <span>· {ev.venue}</span>}
                  {ev.date && <span>· {ev.date}</span>}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => startEdit(ev)}
                  className="p-2 bg-purple-500/10 hover:bg-purple-500/30 text-purple-400 rounded-md transition-colors"
                  title="Edit event"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { if (confirm("Delete this event and its results?")) deleteEvent(ev.id); }}
                  className="p-2 bg-red-500/10 hover:bg-red-500/30 text-red-500 rounded-md transition-colors"
                  title="Delete event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {events.length === 0 && <p className="text-gray-500 text-sm">No events yet.</p>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  TEAMS MANAGER
// ─────────────────────────────────────────────
const BLANK_TEAM = { name: "", logo: "" };

function TeamsManager({ teams, addTeam, updateTeam, deleteTeam }) {
  const [form, setForm] = useState(BLANK_TEAM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const flash = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setForm({ name: t.name, logo: t.logo || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(BLANK_TEAM);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name) return flash("Team name is required.", false);
    setSaving(true);
    try {
      if (editingId) {
        const existing = teams.find(t => t.id === editingId);
        await updateTeam({ ...existing, name: form.name, logo: form.logo });
        flash("Team updated successfully.");
        cancelEdit();
      } else {
        await addTeam({
          id: "t" + Date.now(),
          name: form.name,
          logo: form.logo || "",
          totalPoints: 0,
          color: "text-gray-300",
          bgColor: "bg-white/10",
          border: "border-white/20"
        });
        flash("Team added successfully.");
        setForm(BLANK_TEAM);
      }
    } catch (err) {
      flash("Error saving team: " + err.message, false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      {/* Form */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">{editingId ? "✏️ Edit Team" : "Add Team"}</h2>
          {editingId && (
            <button onClick={cancelEdit} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          )}
        </div>

        {msg && (
          <div className={cn("mb-4 px-4 py-2.5 rounded-lg text-sm font-medium", msg.ok ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30")}>
            {msg.text}
          </div>
        )}

        {editingId && (
          <div className="mb-4 px-4 py-2.5 rounded-lg text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20">
            Editing existing team — scores and results are preserved.
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <input className={inputCls} placeholder="Team Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input className={inputCls} placeholder="Logo (Text/Emoji)" value={form.logo} onChange={e => setForm({ ...form, logo: e.target.value })} />
          <button
            type="submit"
            disabled={saving}
            className={cn(
              "w-full font-bold p-3 rounded-lg transition-colors flex items-center justify-center gap-2",
              editingId ? "bg-purple-600 hover:bg-purple-500 text-white" : "bg-white/10 hover:bg-white/20 text-white"
            )}
          >
            {saving ? "Saving…" : editingId ? <><Save className="w-4 h-4" /> Save Changes</> : <><Plus className="w-4 h-4" /> Add Team</>}
          </button>
        </form>
      </div>

      {/* List */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Existing Teams</h2>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {teams.map(t => (
            <div key={t.id} className={cn("p-3 bg-black/40 border rounded-xl flex items-center justify-between transition-all", editingId === t.id ? "border-purple-500/50 bg-purple-500/5" : "border-white/5")}>
              <div className="flex items-center gap-3 min-w-0">
                {t.logo ? <div className={cn("w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center font-bold", t.bgColor, t.color)}>{t.logo}</div> : null}
                <span className="font-bold text-white truncate max-w-[180px]">{t.name}</span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => startEdit(t)}
                  className="p-2 bg-purple-500/10 hover:bg-purple-500/30 text-purple-400 rounded-md transition-colors"
                  title="Edit team"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { if (confirm("Delete team?")) deleteTeam(t.id); }}
                  className="p-2 bg-red-500/10 hover:bg-red-500/30 text-red-500 rounded-md transition-colors"
                  title="Delete team"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {teams.length === 0 && <p className="text-gray-500 text-sm">No teams yet.</p>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  RESULTS MANAGER
// ─────────────────────────────────────────────
const BLANK_RESULT = {
  eventId: "",
  p1Team: "", p1Pts: 15,
  p2Team: "", p2Pts: 10,
  p3Team: "", p3Pts: 5,
};

function ResultsManager({ results, events, teams, addResult, updateResult, deleteResult }) {
  const completedEvents = events.filter(e => e.status === "Completed");
  const [form, setForm] = useState(BLANK_RESULT);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const flash = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  const startEdit = (r) => {
    const sorted = [...r.positions].sort((a, b) => a.position - b.position);
    setEditingId(r.id);
    setForm({
      eventId: r.eventId,
      p1Team: sorted[0]?.teamId || "",
      p1Pts: sorted[0]?.points || 15,
      p2Team: sorted[1]?.teamId || "",
      p2Pts: sorted[1]?.points || 10,
      p3Team: sorted[2]?.teamId || "",
      p3Pts: sorted[2]?.points || 5,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(BLANK_RESULT);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.eventId || !form.p1Team || !form.p2Team || !form.p3Team) return flash("Fill all required fields.", false);

    const payload = {
      eventId: form.eventId,
      positions: [
        { teamId: form.p1Team, position: 1, points: Number(form.p1Pts) },
        { teamId: form.p2Team, position: 2, points: Number(form.p2Pts) },
        { teamId: form.p3Team, position: 3, points: Number(form.p3Pts) },
      ]
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateResult({ id: editingId, ...payload });
        flash("Result updated successfully.");
        cancelEdit();
      } else {
        if (results.find(r => r.eventId === form.eventId)) return flash("Result already exists for this event. Edit or delete it.", false);
        await addResult({ id: "r" + Date.now(), ...payload });
        flash("Result saved successfully.");
        setForm(BLANK_RESULT);
      }
    } catch (err) {
      flash("Error saving result: " + err.message, false);
    } finally {
      setSaving(false);
    }
  };

  const posLabel = (n) => n === 1 ? "1st" : n === 2 ? "2nd" : "3rd";

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      {/* Form */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">{editingId ? "✏️ Edit Result" : "Add Result to Event"}</h2>
          {editingId && (
            <button onClick={cancelEdit} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          )}
        </div>

        {msg && (
          <div className={cn("mb-4 px-4 py-2.5 rounded-lg text-sm font-medium", msg.ok ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30")}>
            {msg.text}
          </div>
        )}

        {editingId && (
          <div className="mb-4 px-4 py-2.5 rounded-lg text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20">
            Editing existing result — the Firestore record will be updated, not duplicated.
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <select
            className={cn(selectCls, "w-full")}
            value={form.eventId}
            onChange={e => setForm({ ...form, eventId: e.target.value })}
            required
            disabled={!!editingId}
          >
            <option value="">-- Select Completed Event --</option>
            {completedEvents.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>

          <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3">
            {[1, 2, 3].map(pos => (
              <div key={pos} className="flex gap-2 items-center">
                <span className="w-8 text-gray-400 font-bold text-sm flex-shrink-0">{posLabel(pos)}</span>
                <select
                  className="flex-1 bg-black/40 border border-white/10 p-2 rounded text-white outline-none focus:border-purple-500"
                  value={form[`p${pos}Team`]}
                  onChange={e => setForm({ ...form, [`p${pos}Team`]: e.target.value })}
                  required
                >
                  <option value="">Team…</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <input
                  type="number"
                  className="w-16 bg-black/40 border border-white/10 p-2 rounded text-white text-center outline-none focus:border-purple-500"
                  value={form[`p${pos}Pts`]}
                  onChange={e => setForm({ ...form, [`p${pos}Pts`]: e.target.value })}
                />
                <span className="text-gray-400 text-xs">pts</span>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className={cn(
              "w-full font-bold p-3 rounded-lg transition-colors flex items-center justify-center gap-2",
              editingId ? "bg-purple-600 hover:bg-purple-500 text-white" : "bg-primary hover:bg-purple-600 text-white"
            )}
          >
            {saving ? "Saving…" : editingId ? <><Save className="w-4 h-4" /> Save Changes</> : "Save Results"}
          </button>
        </form>
      </div>

      {/* List */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Existing Results</h2>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {results.map(r => {
            const ev = events.find(e => e.id === r.eventId);
            if (!ev) return null;
            return (
              <div key={r.id} className={cn("p-4 bg-black/40 border rounded-xl flex items-center justify-between transition-all", editingId === r.id ? "border-purple-500/50 bg-purple-500/5" : "border-white/5")}>
                <div className="min-w-0 flex-1 mr-3">
                  <p className="font-bold text-white mb-2 truncate">{ev.name}</p>
                  <div className="text-xs text-gray-400 space-y-1">
                    {r.positions.slice().sort((a, b) => a.position - b.position).map(p => {
                      const t = teams.find(tm => tm.id === p.teamId);
                      return <div key={p.position}>{posLabel(p.position)}. {t?.name ?? "Unknown"} (+{p.points})</div>;
                    })}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => startEdit(r)}
                    className="p-2 bg-purple-500/10 hover:bg-purple-500/30 text-purple-400 rounded-md transition-colors"
                    title="Edit result"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { if (confirm("Delete this result?")) deleteResult(r.id); }}
                    className="p-2 bg-red-500/10 hover:bg-red-500/30 text-red-500 rounded-md transition-colors"
                    title="Delete result"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {results.length === 0 && <p className="text-gray-500 text-sm">No results yet.</p>}
        </div>
      </div>
    </div>
  );
}

// helper exposed to ResultsManager (in scope via closure)
function posLabel(n) {
  return n === 1 ? "1st" : n === 2 ? "2nd" : "3rd";
}

// ─────────────────────────────────────────────
//  PENALTIES MANAGER (Minus Points)
// ─────────────────────────────────────────────
const BLANK_PENALTY = { teamId: "", deductPoints: "", reason: "" };

function PenaltiesManager({ penalties, teams, addPenalty, updatePenalty, reversePenalty, reactivatePenalty }) {
  const [form, setForm] = useState(BLANK_PENALTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [filterTeam, setFilterTeam] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedAuditId, setExpandedAuditId] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { type: 'reverse'|'reactivate', penalty }
  const [processingConfirm, setProcessingConfirm] = useState(false);

  const flash = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  };

  const startEdit = (p) => {
    if (p.status === "reversed") {
      return flash("Cannot edit a reversed penalty. Reactivate it first if necessary.", false);
    }
    setEditingId(p.id);
    setForm({
      teamId: p.teamId,
      deductPoints: p.deductPoints,
      reason: p.reason || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(BLANK_PENALTY);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!form.teamId) {
      return flash("Please select a team to penalize.", false);
    }

    const pts = Number(form.deductPoints);
    if (!form.deductPoints || isNaN(pts) || !isFinite(pts) || pts <= 0) {
      return flash("Deduction points must be a valid positive number greater than 0.", false);
    }

    const selectedTeam = teams.find(t => t.id === form.teamId);
    const teamName = selectedTeam ? selectedTeam.name : "Team";

    setSaving(true);
    try {
      if (editingId) {
        await updatePenalty(
          editingId,
          {
            teamId: form.teamId,
            teamName,
            deductPoints: pts,
            reason: form.reason
          },
          auth.currentUser
        );
        flash("Penalty updated and scores recalculated successfully.");
        cancelEdit();
      } else {
        await addPenalty(
          {
            id: "pen_" + Date.now(),
            teamId: form.teamId,
            teamName,
            deductPoints: pts,
            reason: form.reason
          },
          auth.currentUser
        );
        flash(`Penalty of ${pts} points applied to ${teamName}.`);
        setForm(BLANK_PENALTY);
      }
    } catch (err) {
      flash("Error saving penalty: " + err.message, false);
    } finally {
      setSaving(false);
    }
  };

  const handleExecuteConfirm = async () => {
    if (!confirmModal || processingConfirm) return;
    setProcessingConfirm(true);
    try {
      if (confirmModal.type === "reverse") {
        await reversePenalty(confirmModal.penalty.id, auth.currentUser);
        flash(`Penalty of ${confirmModal.penalty.deductPoints} pts for ${confirmModal.penalty.teamName || "team"} reversed successfully.`);
      } else if (confirmModal.type === "reactivate") {
        await reactivatePenalty(confirmModal.penalty.id, auth.currentUser);
        flash(`Penalty of ${confirmModal.penalty.deductPoints} pts for ${confirmModal.penalty.teamName || "team"} reactivated.`);
      }
      setConfirmModal(null);
    } catch (err) {
      flash("Action failed: " + err.message, false);
    } finally {
      setProcessingConfirm(false);
    }
  };

  // Helper date formatter
  const formatDate = (ts) => {
    if (!ts) return "Just now";
    if (ts.toDate && typeof ts.toDate === "function") {
      return ts.toDate().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    }
    if (ts.seconds) {
      return new Date(ts.seconds * 1000).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    }
    const d = new Date(ts);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    }
    return "N/A";
  };

  // Filtered & sorted penalties (newest first)
  const filteredPenalties = penalties
    .filter(p => {
      if (filterTeam !== "all" && p.teamId !== filterTeam) return false;
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      return true;
    })
    .sort((a, b) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

  const totalActivePoints = penalties
    .filter(p => p.status === "active")
    .reduce((sum, p) => sum + (Number(p.deductPoints) || 0), 0);

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      {/* Creation / Edit Form */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MinusCircle className="w-5 h-5 text-red-400" />
              {editingId ? "✏️ Edit Team Penalty" : "Deduct Team Points"}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Apply administrative deductions (e.g., student failed to report for athletics event).
            </p>
          </div>
          {editingId && (
            <button
              onClick={cancelEdit}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 bg-white/5 rounded-lg border border-white/10"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          )}
        </div>

        {msg && (
          <div
            className={cn(
              "mb-4 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              msg.ok
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            )}
          >
            {msg.text}
          </div>
        )}

        {editingId && (
          <div className="mb-4 px-4 py-2.5 rounded-lg text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20">
            Editing existing penalty record — changes will update the record and recalculate scores immediately.
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 font-semibold mb-1.5 block">Select Team *</label>
            <select
              className={cn(selectCls, "w-full")}
              value={form.teamId}
              onChange={e => setForm({ ...form, teamId: e.target.value })}
              required
            >
              <option value="">-- Choose a Team --</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-semibold mb-1.5 block">Points to Deduct (Positive number) *</label>
            <input
              type="number"
              min="0.1"
              step="any"
              className={inputCls}
              placeholder="e.g. 5, 10, 15"
              value={form.deductPoints}
              onChange={e => setForm({ ...form, deductPoints: e.target.value })}
              required
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Enter a positive magnitude (e.g. 10). The system subtracts it from the team's effective score.
            </p>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-semibold mb-1.5 block">Reason / Description (Optional)</label>
            <textarea
              rows={3}
              className={cn(inputCls, "resize-none")}
              placeholder="e.g. Registered athlete failed to report for the 100m sprint."
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className={cn(
              "w-full font-bold p-3 rounded-lg transition-colors flex items-center justify-center gap-2",
              editingId
                ? "bg-purple-600 hover:bg-purple-500 text-white"
                : "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20"
            )}
          >
            {saving ? (
              "Saving…"
            ) : editingId ? (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            ) : (
              <>
                <MinusCircle className="w-4 h-4" /> Apply Penalty
              </>
            )}
          </button>
        </form>
      </div>

      {/* History and Management */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-gray-400" />
              Penalty History
            </h2>
            <p className="text-xs text-gray-400">
              Active penalties: <span className="text-red-400 font-bold">-{totalActivePoints} pts</span>
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              className="bg-black/40 border border-white/10 text-xs text-gray-300 py-1.5 px-2.5 rounded-lg outline-none focus:border-purple-500"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="reversed">Reversed Only</option>
            </select>

            <select
              className="bg-black/40 border border-white/10 text-xs text-gray-300 py-1.5 px-2.5 rounded-lg outline-none focus:border-purple-500 max-w-[130px] truncate"
              value={filterTeam}
              onChange={e => setFilterTeam(e.target.value)}
            >
              <option value="all">All Teams</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
          {filteredPenalties.map(p => {
            const team = teams.find(t => t.id === p.teamId);
            const teamDisplayName = team ? team.name : p.teamName ? `${p.teamName} (Deleted)` : "Unknown Team";
            const isActive = p.status === "active";
            const isEditing = editingId === p.id;
            const isAuditExpanded = expandedAuditId === p.id;

            return (
              <div
                key={p.id}
                className={cn(
                  "p-4 bg-black/40 border rounded-xl transition-all space-y-3",
                  isEditing
                    ? "border-purple-500/50 bg-purple-500/5"
                    : isActive
                    ? "border-red-500/20 bg-red-500/[0.02]"
                    : "border-white/5 opacity-80"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-white truncate max-w-[200px]">
                        {teamDisplayName}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[11px] font-bold border",
                          isActive
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : "bg-gray-500/20 text-gray-400 border-gray-500/30 line-through"
                        )}
                      >
                        -{p.deductPoints} pts
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[11px] font-medium border",
                          isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        )}
                      >
                        {isActive ? "Active" : "Reversed"}
                      </span>
                    </div>

                    {p.reason ? (
                      <p className="text-xs text-gray-300 italic mb-2 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                        “{p.reason}”
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 italic mb-2">No description provided.</p>
                    )}

                    <div className="text-[11px] text-gray-400 flex flex-wrap gap-x-3 gap-y-1">
                      <span>{formatDate(p.createdAt)}</span>
                      <span>By: {p.createdByEmail || "Admin"}</span>
                      {p.reversedAt && (
                        <span className="text-amber-400">
                          · Reversed {formatDate(p.reversedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 flex-shrink-0 items-center">
                    {isActive ? (
                      <>
                        <button
                          onClick={() => startEdit(p)}
                          className="p-2 bg-purple-500/10 hover:bg-purple-500/30 text-purple-400 rounded-md transition-colors"
                          title="Edit penalty"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmModal({ type: "reverse", penalty: p })}
                          className="p-2 bg-amber-500/10 hover:bg-amber-500/30 text-amber-400 rounded-md transition-colors"
                          title="Reverse penalty (restore points)"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmModal({ type: "reactivate", penalty: p })}
                        className="p-2 bg-blue-500/10 hover:bg-blue-500/30 text-blue-400 rounded-md transition-colors"
                        title="Reactivate penalty (deduct points again)"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedAuditId(isAuditExpanded ? null : p.id)}
                      className={cn(
                        "p-2 rounded-md transition-colors",
                        isAuditExpanded
                          ? "bg-white/20 text-white"
                          : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                      )}
                      title="View audit history"
                    >
                      <History className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Audit trail drawer */}
                {isAuditExpanded && (
                  <div className="mt-3 pt-3 border-t border-white/10 text-xs space-y-2 bg-black/30 p-3 rounded-lg">
                    <p className="font-semibold text-gray-300">Audit History Log:</p>
                    {p.auditHistory && p.auditHistory.length > 0 ? (
                      p.auditHistory.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-gray-400 border-l-2 border-purple-500/40 pl-2">
                          <span className="text-gray-500 font-mono text-[10px]">
                            {item.timestamp ? new Date(item.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                          </span>
                          <span>
                            <strong className="text-white capitalize">{item.action}</strong> by {item.byEmail || "Admin"}
                            {item.action === "created" && ` (${item.deductPoints} pts)`}
                            {item.changes && ` (updated fields)`}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-[11px]">Created on {formatDate(p.createdAt)} by {p.createdByEmail || "Admin"}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filteredPenalties.length === 0 && (
            <div className="p-8 border border-white/5 rounded-xl text-center bg-black/20">
              <MinusCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No penalties found matching current filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Reverse / Reactivate */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e15] border border-white/20 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-3 rounded-xl border",
                  confirmModal.type === "reverse"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                )}
              >
                {confirmModal.type === "reverse" ? (
                  <RotateCcw className="w-6 h-6" />
                ) : (
                  <RefreshCw className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {confirmModal.type === "reverse" ? "Reverse Penalty?" : "Reactivate Penalty?"}
                </h3>
                <p className="text-xs text-gray-400">Confirmation Required</p>
              </div>
            </div>

            <div className="text-sm text-gray-300 space-y-2">
              {confirmModal.type === "reverse" ? (
                <>
                  <p>
                    Are you sure you want to reverse this penalty of{" "}
                    <span className="font-bold text-amber-400">
                      {confirmModal.penalty.deductPoints} points
                    </span>{" "}
                    for{" "}
                    <span className="font-bold text-white">
                      {confirmModal.penalty.teamName || "the team"}
                    </span>
                    ?
                  </p>
                  <p className="text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                    ✓ Points will be immediately restored to the team's effective score. The record will remain in history marked as Reversed.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Are you sure you want to reactivate this penalty of{" "}
                    <span className="font-bold text-purple-400">
                      {confirmModal.penalty.deductPoints} points
                    </span>{" "}
                    for{" "}
                    <span className="font-bold text-white">
                      {confirmModal.penalty.teamName || "the team"}
                    </span>
                    ?
                  </p>
                  <p className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                    ⚠ This will re-apply the deduction of {confirmModal.penalty.deductPoints} points to the team's effective score.
                  </p>
                </>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium border border-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteConfirm}
                disabled={processingConfirm}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-colors",
                  confirmModal.type === "reverse"
                    ? "bg-amber-600 hover:bg-amber-500 text-white"
                    : "bg-purple-600 hover:bg-purple-500 text-white"
                )}
              >
                {processingConfirm
                  ? "Processing…"
                  : confirmModal.type === "reverse"
                  ? "Yes, Reverse Penalty"
                  : "Yes, Reactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
