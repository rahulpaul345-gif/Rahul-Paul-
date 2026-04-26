import React, { useState, useEffect } from 'react';
import { CalendarEvent, getEvents, addEvent } from '../services/calendarService';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Loader2, Bell } from 'lucide-react';
import { motion } from 'motion/react';

interface CalendarSectionProps {
  accessToken: string | null;
  onRequestToken: () => void;
}

export function CalendarSection({ accessToken, onRequestToken }: CalendarSectionProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accessToken) {
      loadEvents();
    }
  }, [accessToken]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents(accessToken!);
      setEvents(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!accessToken) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 bg-white rounded-3xl border border-slate-200">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
          <CalendarIcon className="w-10 h-10 text-indigo-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800">Google Calendar</h2>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">Connect your Google account to manage your schedule with Nova AI.</p>
        </div>
        <button 
          onClick={onRequestToken}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
        >
          Enable Access
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-slate-800">Upcoming Events</h2>
        </div>
        <button 
          onClick={loadEvents}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-slate-50 transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {events.length === 0 ? (
          <div className="text-center py-12 text-slate-400 italic text-sm">No upcoming events found.</div>
        ) : (
          events.map(event => (
            <motion.div 
              key={event.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all cursor-default"
            >
              <h3 className="font-bold text-slate-800 text-sm mb-3">
                {event.summary}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    {new Date(event.start.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                {event.description && (
                  <div className="flex items-start gap-2 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                    <p className="line-clamp-2">{event.description}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
