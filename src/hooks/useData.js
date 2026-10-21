import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export function useData() {
  const [teams, setTeams] = useState([]);
  const [events, setEvents] = useState([]);
  const [results, setResults] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let status = { teams: false, events: false, results: false, penalties: false };
    const checkLoaded = (key) => {
      if (!status[key]) {
        status[key] = true;
        if (status.teams && status.events && status.results && status.penalties) {
          setIsLoaded(true);
        }
      }
    };

    const unsubTeams = onSnapshot(collection(db, "teams"), (snapshot) => {
      setTeams(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      checkLoaded("teams");
    });

    const unsubEvents = onSnapshot(collection(db, "events"), (snapshot) => {
      setEvents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      checkLoaded("events");
    });

    const unsubResults = onSnapshot(collection(db, "results"), (snapshot) => {
      setResults(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      checkLoaded("results");
    });

    const unsubPenalties = onSnapshot(
      collection(db, "penalties"),
      (snapshot) => {
        setPenalties(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        checkLoaded("penalties");
      },
      (err) => {
        // When public users access without admin auth, Firestore rules safely prevent read
        console.warn("Penalties read restricted or unauthenticated:", err.message);
        checkLoaded("penalties");
      }
    );

    return () => {
      unsubTeams();
      unsubEvents();
      unsubResults();
      unsubPenalties();
    };
  }, []);

  // CRUD Teams
  const addTeam = async (team) => await setDoc(doc(db, "teams", team.id), team);
  const updateTeam = async (team) => await updateDoc(doc(db, "teams", team.id), team);
  const deleteTeam = async (id) => await deleteDoc(doc(db, "teams", id));

  // CRUD Events
  const addEvent = async (event) => await setDoc(doc(db, "events", event.id), event);
  const updateEvent = async (event) => await updateDoc(doc(db, "events", event.id), event);
  const deleteEvent = async (id) => {
    await deleteDoc(doc(db, "events", id));
    // cascade delete results for this event
    const resultsForEvent = results.filter(r => r.eventId === id);
    for (const r of resultsForEvent) {
      await deleteDoc(doc(db, "results", r.id));
    }
  };

  // CRUD Results
  const addResult = async (result) => await setDoc(doc(db, "results", result.id), result);
  const updateResult = async (result) => await updateDoc(doc(db, "results", result.id), result);
  const deleteResult = async (id) => await deleteDoc(doc(db, "results", id));

  // Helper to sync aggregate penalty total to team document for safe public real-time display
  const syncTeamPenaltyTotal = async (teamId, penaltiesList) => {
    if (!teamId) return;
    const activeForTeam = (penaltiesList || penalties).filter(p => p.teamId === teamId && p.status === "active");
    const totalDeduction = activeForTeam.reduce((sum, p) => sum + (Number(p.deductPoints) || 0), 0);
    try {
      await updateDoc(doc(db, "teams", teamId), { penaltyTotal: totalDeduction });
    } catch (err) {
      console.warn("Failed to sync team penaltyTotal:", err.message);
    }
  };

  // Penalty Management (Admin-only actions)
  const addPenalty = async (penaltyData, user) => {
    const penaltyId = penaltyData.id || "p_" + Date.now();
    const newPenalty = {
      id: penaltyId,
      teamId: penaltyData.teamId,
      teamName: penaltyData.teamName || "",
      deductPoints: Number(penaltyData.deductPoints),
      reason: penaltyData.reason ? penaltyData.reason.trim() : "",
      status: "active",
      createdAt: serverTimestamp(),
      createdByUid: user?.uid || null,
      createdByEmail: user?.email || user?.displayName || "Admin",
      updatedAt: null,
      updatedByUid: null,
      reversedAt: null,
      reversedByUid: null,
      reversedByEmail: null,
      reactivatedAt: null,
      reactivatedByUid: null,
      reactivatedByEmail: null,
      auditHistory: [
        {
          action: "created",
          timestamp: new Date().toISOString(),
          byUid: user?.uid || null,
          byEmail: user?.email || user?.displayName || "Admin",
          teamId: penaltyData.teamId,
          teamName: penaltyData.teamName || "",
          deductPoints: Number(penaltyData.deductPoints),
          reason: penaltyData.reason ? penaltyData.reason.trim() : ""
        }
      ]
    };

    await setDoc(doc(db, "penalties", penaltyId), newPenalty);
    await syncTeamPenaltyTotal(penaltyData.teamId, [...penalties, newPenalty]);
  };

  const updatePenalty = async (penaltyId, updatedFields, user) => {
    const existing = penalties.find(p => p.id === penaltyId);
    if (!existing) throw new Error("Penalty record not found");

    const oldTeamId = existing.teamId;
    const newTeamId = updatedFields.teamId || existing.teamId;
    const newDeductPoints = Number(updatedFields.deductPoints);

    const auditEntry = {
      action: "updated",
      timestamp: new Date().toISOString(),
      byUid: user?.uid || null,
      byEmail: user?.email || user?.displayName || "Admin",
      previous: {
        teamId: existing.teamId,
        teamName: existing.teamName,
        deductPoints: existing.deductPoints,
        reason: existing.reason || ""
      },
      updated: {
        teamId: newTeamId,
        teamName: updatedFields.teamName || existing.teamName,
        deductPoints: newDeductPoints,
        reason: updatedFields.reason !== undefined ? updatedFields.reason.trim() : existing.reason
      }
    };

    const updatedDoc = {
      ...existing,
      teamId: newTeamId,
      teamName: updatedFields.teamName || existing.teamName,
      deductPoints: newDeductPoints,
      reason: updatedFields.reason !== undefined ? updatedFields.reason.trim() : existing.reason,
      updatedAt: serverTimestamp(),
      updatedByUid: user?.uid || null,
      updatedByEmail: user?.email || user?.displayName || "Admin",
      auditHistory: [...(existing.auditHistory || []), auditEntry]
    };

    await updateDoc(doc(db, "penalties", penaltyId), updatedDoc);

    const nextPenalties = penalties.map(p => p.id === penaltyId ? updatedDoc : p);
    await syncTeamPenaltyTotal(newTeamId, nextPenalties);
    if (oldTeamId !== newTeamId) {
      await syncTeamPenaltyTotal(oldTeamId, nextPenalties);
    }
  };

  const reversePenalty = async (penaltyId, user) => {
    const existing = penalties.find(p => p.id === penaltyId);
    if (!existing) throw new Error("Penalty record not found");
    if (existing.status === "reversed") throw new Error("Penalty is already reversed");

    const auditEntry = {
      action: "reversed",
      timestamp: new Date().toISOString(),
      byUid: user?.uid || null,
      byEmail: user?.email || user?.displayName || "Admin"
    };

    const updatedDoc = {
      ...existing,
      status: "reversed",
      reversedAt: serverTimestamp(),
      reversedByUid: user?.uid || null,
      reversedByEmail: user?.email || user?.displayName || "Admin",
      auditHistory: [...(existing.auditHistory || []), auditEntry]
    };

    await updateDoc(doc(db, "penalties", penaltyId), updatedDoc);

    const nextPenalties = penalties.map(p => p.id === penaltyId ? updatedDoc : p);
    await syncTeamPenaltyTotal(existing.teamId, nextPenalties);
  };

  const reactivatePenalty = async (penaltyId, user) => {
    const existing = penalties.find(p => p.id === penaltyId);
    if (!existing) throw new Error("Penalty record not found");
    if (existing.status === "active") throw new Error("Penalty is already active");

    const auditEntry = {
      action: "reactivated",
      timestamp: new Date().toISOString(),
      byUid: user?.uid || null,
      byEmail: user?.email || user?.displayName || "Admin"
    };

    const updatedDoc = {
      ...existing,
      status: "active",
      reactivatedAt: serverTimestamp(),
      reactivatedByUid: user?.uid || null,
      reactivatedByEmail: user?.email || user?.displayName || "Admin",
      auditHistory: [...(existing.auditHistory || []), auditEntry]
    };

    await updateDoc(doc(db, "penalties", penaltyId), updatedDoc);

    const nextPenalties = penalties.map(p => p.id === penaltyId ? updatedDoc : p);
    await syncTeamPenaltyTotal(existing.teamId, nextPenalties);
  };

  const calculateLeaderboard = () => {
    if (!isLoaded) return [];
    let teamScores = {};
    teams.forEach(t => teamScores[t.id] = { ...t, totalPoints: 0 });

    results.forEach(result => {
      result.positions.forEach(pos => {
        if (teamScores[pos.teamId]) {
          teamScores[pos.teamId].totalPoints += Number(pos.points) || 0;
        }
      });
    });

    // Deduct active penalties:
    if (penalties && penalties.length > 0) {
      penalties.forEach(p => {
        if (p.status === "active" && teamScores[p.teamId]) {
          teamScores[p.teamId].totalPoints -= Number(p.deductPoints) || 0;
        }
      });
    } else {
      // Fallback for public score views when penalties collection is restricted to admin by Firestore rules
      teams.forEach(t => {
        if (teamScores[t.id] && t.penaltyTotal) {
          teamScores[t.id].totalPoints -= Number(t.penaltyTotal) || 0;
        }
      });
    }

    return Object.values(teamScores).sort((a, b) => b.totalPoints - a.totalPoints);
  };

  return { 
    teams, events, results, penalties, isLoaded, 
    addTeam, updateTeam, deleteTeam,
    addEvent, updateEvent, deleteEvent,
    addResult, updateResult, deleteResult,
    addPenalty, updatePenalty, reversePenalty, reactivatePenalty,
    calculateLeaderboard 
  };
}

