import React, { useState, useEffect } from 'react';
import { Note, getNotes, addNote, updateNote, deleteNote } from '../services/notesService';
import { suggestCategory } from '../services/geminiService';
import { Plus, Search, Trash2, Tag, Wand2, X, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotesSectionProps {
  userId: string;
}

export function NotesSection({ userId }: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', category: '' });
  const [suggesting, setSuggesting] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [userId]);

  const loadNotes = async () => {
    const data = await getNotes(userId);
    setNotes(data);
  };

  const handleAddNote = async () => {
    if (!newNote.title.trim()) return;
    await addNote(userId, newNote.title, newNote.content, newNote.category || 'General');
    setNewNote({ title: '', content: '', category: '' });
    setIsAdding(false);
    loadNotes();
  };

  const handleSuggestCategory = async () => {
    if (!newNote.content.trim()) return;
    setSuggesting(true);
    const category = await suggestCategory(newNote.content);
    setNewNote(prev => ({ ...prev, category }));
    setSuggesting(false);
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase()) ||
    n.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search notes, categories..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="ml-4 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-slate-50 border-2 border-indigo-100 rounded-2xl p-4 space-y-4 shadow-xl"
            >
              <div className="flex justify-between items-center">
                <input 
                  placeholder="Note Title" 
                  className="bg-transparent text-lg font-bold focus:outline-none w-full"
                  value={newNote.title}
                  onChange={e => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                />
                <button onClick={() => setIsAdding(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <textarea 
                placeholder="Write your note content here..." 
                className="bg-transparent w-full h-32 text-sm focus:outline-none resize-none"
                value={newNote.content}
                onChange={e => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              />
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input 
                    placeholder="Category" 
                    className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                    value={newNote.category}
                    onChange={e => setNewNote(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
                <button 
                  onClick={handleSuggestCategory}
                  disabled={suggesting}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${suggesting ? 'animate-spin' : ''}`} />
                  AI Suggest
                </button>
              </div>
              <button 
                onClick={handleAddNote}
                className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm"
              >
                Save Note
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-4">
          {filteredNotes.map(note => (
            <motion.div 
              layout
              key={note.id} 
              className="group p-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 transition-all hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800">{note.title}</h3>
                <button 
                  onClick={() => deleteNote(note.id!).then(loadNotes)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-slate-500 line-clamp-3 mb-4 leading-relaxed">{note.content}</p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {note.category}
                </span>
                <span className="text-[10px] text-slate-400 ml-auto">
                   {new Date(note.updatedAt?.seconds * 1000).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
