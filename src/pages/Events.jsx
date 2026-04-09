import { useState } from "react";
import { useData } from "../hooks/useData";
import { EventCard } from "../components/EventCard";
import { Calendar } from "lucide-react";
import { cn } from "../lib/utils";

export default function Events() {
  const { events } = useData();
  const [activeTab, setActiveTab] = useState("All");

  const filteredEvents = events.filter(e => {
    if (activeTab === "Upcoming") return e.status === "Upcoming";
    if (activeTab === "Completed") return e.status === "Completed";
    return true;
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <Calendar className="w-8 h-8 text-blue-400" />
          </div>
          Tournament Events
        </h1>
        <p className="text-gray-400 mt-3 text-lg">Detailed schedule and information for all activities.</p>
      </header>

      {/* Tabs */}
      <div className="flex p-1 bg-card backdrop-blur-md rounded-xl max-w-md w-full border border-white/10 box-border">
        {["All", "Upcoming", "Completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300",
              activeTab === tab 
                ? "bg-white/15 text-white shadow-md border border-white/10 text-shadow-sm" 
                : "text-gray-400 hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div key={event.id}>
            <EventCard event={event} />
          </div>
        ))}
        {filteredEvents.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-500 border border-dashed border-white/10 rounded-2xl bg-black/20">
            No events found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}
