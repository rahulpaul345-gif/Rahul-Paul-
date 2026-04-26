import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Clock, 
  FileText, 
  Calendar as CalendarIcon, 
  Cpu, 
  Zap,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { getNotes, Note } from '../services/notesService';
import { getEvents, CalendarEvent } from '../services/calendarService';

interface DashboardSectionProps {
  userId: string;
  accessToken: string | null;
  isListening: boolean;
  isSpeaking: boolean;
  continuousMode?: boolean;
  neuralEnergy?: number;
  isCommandActive?: boolean;
}

export function DashboardSection({ 
  userId, 
  accessToken, 
  isListening, 
  isSpeaking,
  continuousMode = false,
  neuralEnergy = 30,
  isCommandActive = false
}: DashboardSectionProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [notesData, eventsData] = await Promise.all([
          getNotes(userId),
          accessToken ? getEvents(accessToken) : Promise.resolve([])
        ]);
        setNotes(notesData.slice(0, 3));
        setEvents(eventsData.slice(0, 3));
      } catch (error) {
        console.error("Dashboard load error", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId, accessToken]);

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* Visualizer Column */}
      <div className="lg:col-span-2 space-y-6 flex flex-col">
        <div className={`flex-1 rounded-[2.5rem] p-10 flex flex-col items-center justify-center relative overflow-hidden text-white shadow-2xl transition-all duration-500 ${continuousMode ? 'bg-indigo-950 scale-[1.02]' : 'bg-slate-900 shadow-indigo-500/10'}`}>
          {/* Animated Background Gradients */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
                opacity: continuousMode ? [0.4, 0.6, 0.4] : 0.2
              }}
              transition={{ duration: continuousMode ? 5 : 20, repeat: Infinity }}
              className="absolute -top-1/2 -left-1/2 w-full h-full bg-indigo-600 blur-[120px] rounded-full" 
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.5, 1],
                rotate: [0, -90, 0],
                opacity: continuousMode ? [0.4, 0.6, 0.4] : 0.2
              }}
              transition={{ duration: continuousMode ? 4 : 15, repeat: Infinity }}
              className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-600 blur-[120px] rounded-full" 
            />
          </div>

          {/* Neural Lines for Continuous Mode */}
          {continuousMode && (
             <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -100, y: Math.random() * 100 + '%' }}
                    animate={{ x: '120%' }}
                    transition={{ duration: 1 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                    className="absolute h-px w-20 bg-indigo-400"
                  />
                ))}
             </div>
          )}

          {/* AI Core Visualizer */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-8 relative flex items-center justify-center">
              <div className="flex items-end gap-1 h-12 mb-8 absolute -top-16">
                {(isListening || isSpeaking) ? Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      height: [8, Math.random() * 40 + 10, 8]
                    }}
                    transition={{ 
                      duration: 0.5 + Math.random() * 0.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className={`w-1 rounded-full ${isSpeaking ? 'bg-indigo-500' : 'bg-indigo-400'}`}
                  />
                )) : (
                  <div className="flex gap-1 h-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="w-1 h-1 bg-slate-200 rounded-full" />
                    ))}
                  </div>
                )}
              </div>
              <motion.div
                animate={{ 
                  scale: (isListening || isSpeaking || continuousMode) ? [1, 1.3, 1] : 1,
                  opacity: (isListening || isSpeaking || continuousMode) ? [0.5, 1, 0.5] : 0.8
                }}
                transition={{ duration: continuousMode ? 0.8 : 1.5, repeat: Infinity }}
                className={`w-48 h-48 rounded-full blur-2xl absolute inset-0 ${isSpeaking ? 'bg-purple-500/20' : continuousMode ? 'bg-indigo-400/30' : 'bg-indigo-500/10'}`}
              />
              <motion.div 
                animate={{ 
                  rotate: isSpeaking || continuousMode ? [0, 360] : 360,
                  scale: isCommandActive ? [1, 1.4, 1] : (isListening || isSpeaking || continuousMode) ? [1, 1.15, 1] : 1,
                  borderColor: isCommandActive ? 'rgba(255,255,255,0.8)' : isSpeaking ? 'rgba(168,85,247,0.5)' : continuousMode ? 'rgba(99,102,241,0.6)' : 'rgba(99,102,241,0.5)'
                }}
                transition={{ 
                  rotate: { duration: isSpeaking ? 2 : continuousMode ? 4 : 10, repeat: Infinity, ease: "linear" },
                  scale: { duration: isCommandActive ? 0.3 : continuousMode ? 0.4 : 0.5, repeat: isCommandActive ? 0 : Infinity }
                }}
                className={`w-48 h-48 rounded-[3rem] border-2 flex items-center justify-center relative backdrop-blur-sm transition-all ${isCommandActive ? 'bg-white/20 shadow-[0_0_80px_rgba(255,255,255,0.6)]' : isSpeaking ? 'border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.3)]' : continuousMode ? 'border-indigo-400/60 shadow-[0_0_50px_rgba(99,102,241,0.4)]' : 'border-indigo-500/50'}`}
              >
                <Cpu className={`w-16 h-16 ${isCommandActive ? 'text-white' : isListening ? 'text-indigo-400' : isSpeaking ? 'text-purple-400' : continuousMode ? 'text-white shadow-lg' : 'text-slate-600'} transition-colors`} />
                
                {/* Floating Particles */}
                {(isListening || isSpeaking || continuousMode) && Array.from({ length: continuousMode ? 12 : 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [-20, -120],
                      opacity: [0, 1, 0],
                      x: [0, (i % 2 === 0 ? 50 : -50)]
                    }}
                    transition={{ 
                      duration: (continuousMode ? 0.5 : 1) + Math.random(), 
                      repeat: Infinity, 
                      delay: i * (continuousMode ? 0.05 : 0.2) 
                    }}
                    className={`absolute w-1 h-1 rounded-full ${isSpeaking ? 'bg-purple-400' : 'bg-indigo-400'}`}
                  />
                ))}
              </motion.div>
            </div>
            
            <motion.h2 
              className="text-3xl font-bold tracking-tighter mb-2"
              animate={{ opacity: (isListening || isSpeaking || isCommandActive) ? [0.7, 1, 0.7] : 1 }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isCommandActive ? 'COMMAND RECOGNIZED' : isListening ? 'Awaiting Audio Signal' : isSpeaking ? 'Transmitting Response' : continuousMode ? 'NEURAL LINK ACTIVE' : 'Zoya Systems Online'}
            </motion.h2>
            <p className="text-slate-400 text-sm font-mono tracking-widest uppercase truncate max-w-xs px-4">
              {isCommandActive ? 'Executing System Directive...' : isListening ? 'Processing Neural Input...' : isSpeaking ? 'Synthesizing Speech...' : continuousMode ? 'Continuous Stream Phase' : 'Standby for Operator Link'}
            </p>
          </div>

          <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end opacity-40">
            <div className="flex gap-4">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Neural Intensity</div>
                <div className="flex gap-1 h-6 items-end">
                  {[40, 60, 30, 80, 50, 70, 45].map((h, i) => (
                    <motion.div 
                      key={i} 
                      animate={{ height: (isListening || continuousMode) ? [h, h*1.5, h] : h }} 
                      transition={{ duration: continuousMode ? 0.3 : 0.5, repeat: Infinity, delay: i * 0.1 }}
                      className={`w-1.5 rounded-t-sm ${continuousMode ? 'bg-white' : 'bg-indigo-500'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Synaptic Energy</div>
              <div className={`text-lg font-mono flex items-center gap-2 ${continuousMode ? 'text-white' : ''}`}>
                <motion.span animate={{ opacity: [1, 0.5, 1] }}>{neuralEnergy / 100}</motion.span>
                <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                   <motion.div 
                     animate={{ width: neuralEnergy + '%' }}
                     className="h-full bg-indigo-400" 
                   />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-indigo-200 transition-all cursor-default">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Productivity</div>
              <div className="text-xl font-bold flex items-center gap-2">
                84% <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-indigo-200 transition-all cursor-default">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Synapse Link</div>
              <div className="text-xl font-bold">Stable</div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Side Column */}
      <div className="space-y-6 flex flex-col">
        {/* Quick View Notes */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500"><FileText className="w-4 h-4" /></div>
              <h3 className="font-bold text-slate-800">Recent Notes</h3>
            </div>
            <button className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
          </div>
          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />)
            ) : notes.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm italic">No records found</div>
            ) : (
              notes.map(note => (
                <div key={note.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all cursor-default">
                  <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">{note.category}</div>
                  <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{note.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{note.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Calendar Snapshot */}
        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-200 h-1/2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white"><CalendarIcon className="w-4 h-4" /></div>
              <h3 className="font-bold">Temporal Sync</h3>
            </div>
          </div>
          <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar-white pr-2">
            {!accessToken ? (
               <div className="text-white/60 text-xs text-center py-8 italic">Authentication Required</div>
            ) : events.length === 0 ? (
              <div className="text-white/60 text-xs text-center py-8 italic">Zero Events Found</div>
            ) : (
              events.map(event => (
                <div key={event.id} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-white transition-transform group-hover:scale-150" />
                    <div className="w-px flex-1 bg-white/20 my-1" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-white/60 uppercase tracking-widest">
                      {new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <h4 className="font-bold text-sm leading-tight mb-4">{event.summary}</h4>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="mt-4 w-full py-2.5 bg-white/10 hover:bg-white/20 transition-all rounded-xl text-xs font-bold flex items-center justify-center gap-2">
            Schedule Task <Clock className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
