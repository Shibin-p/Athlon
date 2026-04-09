import { Calendar, MapPin, Tag } from "lucide-react";
import { cn } from "../lib/utils";

export function EventCard({ event }) {
  const isCompleted = event.status === "Completed";

  return (
    <div className="group relative p-6 rounded-2xl border border-cardBorder bg-card backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <div className="absolute top-5 right-5">
        <span className={cn(
          "px-3 py-1 text-xs font-semibold rounded-full border",
          isCompleted 
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
        )}>
          {event.status}
        </span>
      </div>

      <h3 className="text-xl font-bold mb-5 pr-24 text-white group-hover:text-primary transition-colors">
        {event.name}
      </h3>
      
      <div className="space-y-3 text-sm text-gray-400">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span>{event.venue}</span>
        </div>
        <div className="flex items-center gap-3">
          <Tag className="w-4 h-4 text-gray-500" />
          <span>{event.category}</span>
        </div>
      </div>
    </div>
  );
}
