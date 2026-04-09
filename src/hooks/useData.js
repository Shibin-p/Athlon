import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

export function useData() {
  const [teams, setTeams] = useState([]);
  const [events, setEvents] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let status = { teams: false, events: false, results: false };
    const checkLoaded = (key) => {
      if (!status[key]) {
        status[key] = true;
        if (status.teams && status.events && status.results) {
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

    return () => {
      unsubTeams();
      unsubEvents();
      unsubResults();
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

    return Object.values(teamScores).sort((a, b) => b.totalPoints - a.totalPoints);
  };

  return { 
    teams, events, results, isLoaded, 
    addTeam, updateTeam, deleteTeam,
    addEvent, updateEvent, deleteEvent,
    addResult, updateResult, deleteResult,
    calculateLeaderboard 
  };
}
