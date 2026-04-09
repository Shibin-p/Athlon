export const initialTeams = [
  { id: "t1", name: "Alpha", logo: "A", color: "text-purple-400", bgColor: "bg-purple-500/10", border: "border-purple-500/20" },
  { id: "t2", name: "Beta", logo: "B", color: "text-blue-400", bgColor: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "t3", name: "Gamma", logo: "G", color: "text-green-400", bgColor: "bg-green-500/10", border: "border-green-500/20" },
  { id: "t4", name: "Delta", logo: "D", color: "text-rose-400", bgColor: "bg-rose-500/10", border: "border-rose-500/20" },
];

export const initialEvents = [
  { id: "e1", name: "100m Sprint Final", date: "2026-05-10", venue: "Main Track", category: "Athletics", status: "Upcoming" },
  { id: "e2", name: "Basketball Finals", date: "2026-05-11", venue: "Indoor Stadium", category: "Games", status: "Upcoming" },
  { id: "e3", name: "Chess Tournament", date: "2026-04-05", venue: "Room 101", category: "Games", status: "Completed" },
  { id: "e4", name: "Tug of War", date: "2026-04-06", venue: "Open Field", category: "Athletics", status: "Completed" },
];

export const initialResults = [
  { 
    id: "r1", 
    eventId: "e3", 
    positions: [
      { teamId: "t2", position: 1, points: 15 }, 
      { teamId: "t1", position: 2, points: 10 }, 
      { teamId: "t4", position: 3, points: 5 }
    ] 
  },
  { 
    id: "r2", 
    eventId: "e4", 
    positions: [
      { teamId: "t1", position: 1, points: 15 }, 
      { teamId: "t3", position: 2, points: 10 }, 
      { teamId: "t2", position: 3, points: 5 }
    ] 
  },
];
