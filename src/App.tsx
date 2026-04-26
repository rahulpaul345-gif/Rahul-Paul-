import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Terminal, 
  Cpu, 
  Layers, 
  Trash2, 
  Menu, 
  X,
  Settings,
  ChevronRight,
  Database,
  Image as ImageIcon,
  Paperclip,
  Calendar as CalendarIcon,
  FileText,
  LogOut,
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  Activity,
  Zap,
  Sliders
} from 'lucide-react';
import { streamChat, Message, MessagePart, textToSpeech } from './services/geminiService';
import { useAuth } from './hooks/useAuth';
import { useVoice } from './hooks/useVoice';
import { NotesSection } from './components/NotesSection';
import { CalendarSection } from './components/CalendarSection';
import { DashboardSection } from './components/DashboardSection';
import { SettingsModal } from './components/SettingsModal';
import { getUserProfile, saveUserSettings } from './services/userService';
import { auth } from './lib/firebase';

const STORAGE_KEY = 'lumina_chat_history';

type ViewMode = 'chat' | 'notes' | 'calendar' | 'dashboard';

export default function App() {
  const { user, accessToken, loading, loginWithGoogle, getCalendarToken } = useAuth();
  const { isListening, transcript, startListening, stopListening, setTranscript } = useVoice();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [neuralEnergy, setNeuralEnergy] = useState(30);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    language: 'en-US',
    voiceName: 'Kore',
    playbackSpeed: 1.0,
    pitch: 1.0,
    cloudSync: false
  });
  const [isCommandActive, setIsCommandActive] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedImage, setSelectedImage] = useState<{ url: string, base64: string, mimeType: string } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load history & User settings
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }

    async function fetchCloudSettings() {
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile?.settings && profile.settings.cloudSync) {
          setVoiceSettings({
            language: profile.settings.language,
            voiceName: profile.settings.voiceName,
            playbackSpeed: profile.settings.playbackSpeed,
            pitch: profile.settings.pitch || 1.0,
            cloudSync: true
          });
        }
      }
    }
    fetchCloudSettings();
  }, [user]);

  // Sync settings to cloud
  useEffect(() => {
    if (user && voiceSettings.cloudSync) {
      const timeout = setTimeout(() => {
        saveUserSettings(user.uid, voiceSettings);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [voiceSettings, user]);

  // Save history
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  // Voice transcript handling with Dynamic Commands
  useEffect(() => {
    if (transcript && !isStreaming) {
      const lowerTranscript = transcript.toLowerCase().trim();
      
      // Dynamic Voice Commands
      if (lowerTranscript.includes('open settings') || lowerTranscript.includes('show settings')) {
        setIsCommandActive(true);
        setTimeout(() => setIsCommandActive(false), 2000);
        setIsSettingsOpen(true);
        playResponse("Neural configuration interface activated.");
        setTranscript('');
        return;
      }
      if (lowerTranscript.includes('show calendar') || lowerTranscript.includes('open calendar')) {
        setIsCommandActive(true);
        setTimeout(() => setIsCommandActive(false), 2000);
        setViewMode('calendar');
        playResponse("Synchronizing with your temporal schedule.");
        setTranscript('');
        return;
      }
      if (lowerTranscript.includes('show notes') || lowerTranscript.includes('open notes')) {
        setIsCommandActive(true);
        setTimeout(() => setIsCommandActive(false), 2000);
        setViewMode('notes');
        playResponse("Retrieving stored cognitive data.");
        setTranscript('');
        return;
      }
      if (lowerTranscript.includes('go to dashboard') || lowerTranscript.includes('show dashboard')) {
        setIsCommandActive(true);
        setTimeout(() => setIsCommandActive(false), 2000);
        setViewMode('dashboard');
        playResponse("Returning to primary command center.");
        setTranscript('');
        return;
      }

      setInput(transcript);
      if (continuousMode) {
        setTimeout(() => handleSubmit(), 500);
      }
    }
  }, [transcript]);

  const playResponse = async (text: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const base64 = await textToSpeech(text, voiceSettings.voiceName);
    if (base64) {
      const audio = new Audio(`data:audio/mp3;base64,${base64}`);
      audioRef.current = audio;
      audio.playbackRate = voiceSettings.playbackSpeed;
      // Note: standard HTML5 Audio doesn't support pitch shifting without speed change natively
      // but we can use presets or explain it in settings
      setIsSpeaking(true);
      setNeuralEnergy(prev => Math.min(100, prev + 15));

      audio.onended = () => {
        setIsSpeaking(false);
        if (continuousMode) {
          startListening(voiceSettings.language);
        }
      };

      audio.onerror = () => {
        setIsSpeaking(false);
      };

      audio.play().catch(err => {
        console.error("Playback failed", err);
        setIsSpeaking(false);
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setSelectedImage({
          url: reader.result as string,
          base64: base64String,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedImage) || isStreaming) return;

    const userParts: MessagePart[] = [{ text: input.trim() }];
    if (selectedImage) {
      userParts.push({
        inlineData: {
          mimeType: selectedImage.mimeType,
          data: selectedImage.base64
        }
      });
    }

    const userMessage: Message = {
      role: 'user',
      parts: userParts
    };

    const currentInput = input.trim();
    const currentImage = selectedImage;
    
    setInput('');
    setSelectedImage(null);
    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    let assistantText = '';
    const newAssistantMessage: Message = {
      role: 'model',
      parts: [{ text: '' }]
    };
    
    setMessages(prev => [...prev, newAssistantMessage]);

    try {
      const historyForAPI = messages.slice(-10);
      const stream = streamChat(
        historyForAPI, 
        currentInput, 
        currentImage ? { mimeType: currentImage.mimeType, data: currentImage.base64 } : undefined,
        voiceSettings.language
      );
      
      for await (const chunk of stream) {
        assistantText += chunk;
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'model') {
            last.parts = [{ text: assistantText }];
          }
          return updated;
        });
      }
    } catch (err) {
      console.error("Streaming error", err);
    } finally {
      setIsStreaming(false);
      if (assistantText) {
        playResponse(assistantText);
      }
    }
  };

  const clearHistory = () => {
    if (window.confirm("Clear all session history?")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full shadow-lg"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-6 text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200 mb-8 rotate-12">
          <Bot className="w-10 h-10 -rotate-12" />
        </div>
        <h1 className="text-4xl font-bold tracking-tighter text-slate-900 mb-2">Welcome to Zoya</h1>
        <p className="text-slate-500 max-w-sm mb-12 leading-relaxed">Your intelligent personal assistant for notes, calendar, and complex reasoning.</p>
        <button 
          onClick={loginWithGoogle}
          className="flex items-center gap-3 px-8 py-3.5 bg-white border border-slate-200 rounded-2xl font-bold shadow-xl hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden relative">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0 md:w-64'
        } border-r border-slate-200 bg-white flex flex-col transition-all duration-300 ease-in-out relative z-30`}
      >
        <div className="p-6 border-b border-slate-100 h-16 flex items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">N</div>
            <span className="font-semibold text-lg tracking-tight text-slate-800">Zoya</span>
          </div>
        </div>

        <div className="flex-1 px-4 space-y-1 py-6 overflow-hidden custom-scrollbar">
          <SidebarNavItem 
            icon={<Activity className="w-5 h-5" />} 
            label="Neural Core" 
            active={viewMode === 'dashboard'} 
            onClick={() => setViewMode('dashboard')}
          />
          <SidebarNavItem 
            icon={<MessageSquare className="w-5 h-5" />} 
            label="Neural Hub" 
            active={viewMode === 'chat'} 
            onClick={() => setViewMode('chat')}
          />
          <SidebarNavItem 
            icon={<FileText className="w-5 h-5" />} 
            label="Note Engine" 
            active={viewMode === 'notes'} 
            onClick={() => setViewMode('notes')}
          />
          <SidebarNavItem 
            icon={<CalendarIcon className="w-5 h-5" />} 
            label="Temporal Link" 
            active={viewMode === 'calendar'} 
            onClick={() => setViewMode('calendar')}
          />
          
          <div className="pt-6 pb-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">History</div>
          <SidebarNavItem icon={<Database className="w-5 h-5" />} label="Archives" />
          <SidebarNavItem icon={<Settings className="w-5 h-5" />} label="Preferences" />
        </div>

        <div className="p-4 border-t border-slate-100 space-y-3">
          <button 
            onClick={() => auth.signOut()}
            className="flex items-center gap-3.5 w-full px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-red-500 transition-all font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Terminate Link</span>
          </button>
          <button 
            onClick={clearHistory}
            className="flex items-center gap-3.5 w-full px-4 py-2.5 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all font-medium text-[11px] uppercase tracking-wider"
          >
            <Trash2 className="w-4 h-4" />
            <span>Purge Memory</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative min-w-0 z-10">
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 md:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Zoya Assistant</h2>
              <span className="text-slate-300">/</span>
              <h1 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                {viewMode === 'chat' ? 'Geometric Interface' : viewMode === 'notes' ? 'Note Repository' : viewMode === 'calendar' ? 'Temporal Link' : 'Neural Core'}
              </h1>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-indigo-600 transition-all"
              title="Calibration Settings"
            >
              <Sliders className="w-5 h-5" />
            </button>
            {viewMode !== 'dashboard' && (
              <button 
                onClick={() => setViewMode('dashboard')}
                className="p-2 text-slate-400 hover:text-indigo-600 transition-all"
              >
                <Activity className="w-5 h-5" />
              </button>
            )}
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-900 leading-none">{user.displayName}</p>
              <p className="text-[8px] text-slate-400 uppercase tracking-wider mt-1">{user.email}</p>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-slate-100 shadow-sm">
              <img src={user.photoURL || undefined} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {viewMode === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-12 pb-48">
                  {messages.length === 0 ? (
                    <WelcomeScreen setInput={setInput} />
                  ) : (
                    messages.map((msg, i) => <ChatMessage key={i} msg={msg} index={i} playResponse={playResponse} />)
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent z-20">
                  <ChatInput 
                    input={input} 
                    setInput={setInput} 
                    handleSubmit={handleSubmit} 
                    isStreaming={isStreaming}
                    fileInputRef={fileInputRef}
                    handleImageSelect={handleImageSelect}
                    selectedImage={selectedImage}
                    setSelectedImage={setSelectedImage}
                    isListening={isListening}
                    startListening={startListening}
                    stopListening={stopListening}
                    isSpeaking={isSpeaking}
                    continuousMode={continuousMode}
                    setContinuousMode={setContinuousMode}
                    voiceSettings={voiceSettings}
                  />
                </div>
              </motion.div>
            )}

            {viewMode === 'notes' && (
              <motion.div 
                key="notes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full p-8"
              >
                <NotesSection userId={user.uid} />
              </motion.div>
            )}

            {viewMode === 'calendar' && (
              <motion.div 
                key="calendar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full p-8"
              >
                <CalendarSection accessToken={accessToken} onRequestToken={getCalendarToken} />
              </motion.div>
            )}

            {viewMode === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="h-full p-8"
              >
                <DashboardSection 
                  userId={user.uid} 
                  accessToken={accessToken} 
                  isListening={isListening} 
                  isSpeaking={isSpeaking}
                  continuousMode={continuousMode}
                  neuralEnergy={neuralEnergy}
                  isCommandActive={isCommandActive}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Right Side Panel */}
      <aside className="hidden xl:flex w-72 bg-slate-50 border-l border-slate-200 p-8 flex-col space-y-8 z-30">
        <div className="space-y-4">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Neural Load</h3>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-700">Synaptic Flow</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">+12%</span>
            </div>
            <div className="flex items-end space-x-1 h-12">
              <div className="flex-1 bg-slate-100 h-[20%] rounded-sm"></div>
              <div className="flex-1 bg-slate-100 h-[45%] rounded-sm"></div>
              <div className="flex-1 bg-indigo-400 h-[90%] rounded-sm"></div>
              <div className="flex-1 bg-indigo-600 h-[65%] rounded-sm"></div>
              <div className="flex-1 bg-indigo-100 h-[40%] rounded-sm"></div>
            </div>
          </div>
        </div>

        <div className="space-y-4 flex-1">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">System Tasks</h3>
          <div className="space-y-2">
            {[
              { label: 'Market Logic Sync', color: 'bg-indigo-500' },
              { label: 'Portfolio Synthesis', color: 'bg-amber-400' },
              { label: 'Neural Mapping', color: 'bg-slate-300' }
            ].map((task, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center space-x-3 group cursor-pointer hover:border-indigo-200 transition-colors">
                <div className={`w-2 h-2 rounded-full ${task.color} group-hover:scale-125 transition-transform`}></div>
                <span className="text-xs font-medium text-slate-600 tracking-tight">{task.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto">
          <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-xl shadow-indigo-100 border border-indigo-500">
            <p className="text-xs font-bold mb-2 flex items-center gap-2 italic">
              <Sparkles className="w-3 h-3" />
              Pro Tip
            </p>
            <p className="text-[11px] leading-relaxed opacity-90 font-medium">Use images to provide visual context for higher synthesis accuracy.</p>
          </div>
        </div>
      </aside>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={voiceSettings}
        setSettings={setVoiceSettings}
      />
    </div>
  );
}

function SidebarNavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl cursor-pointer transition-all group ${
      active ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm shadow-indigo-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
    }`}>
      <div className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-indigo-600' : ''}`}>
        {icon}
      </div>
      <span className="text-sm tracking-tight whitespace-nowrap">{label}</span>
      {active && <motion.div layoutId="sidebar-active" className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
    </div>
  );
}

function WelcomeScreen({ setInput }: { setInput: (v: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center space-y-8 max-w-2xl mx-auto py-20">
      <div className="relative">
        <div className="w-24 h-24 bg-indigo-50 border border-indigo-100 rounded-[2rem] flex items-center justify-center rotate-12 shadow-inner">
          <Sparkles className="w-10 h-10 text-indigo-600 -rotate-12" />
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="text-4xl font-bold tracking-tight text-slate-900">Geometric Logic Sync</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">Initialized and ready to synthesize your instructions with absolute precision.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-12">
        <QuickAction text="Project Strategy" onClick={() => setInput("Outline a strategy for a market exit in the manufacturing sector.")} />
        <QuickAction text="Morning Routine" onClick={() => setInput("Design a bio-optimized morning routine for peak cognitive load.")} />
        <QuickAction text="Portfolio Synthesis" onClick={() => setInput("Analyze the risks of a diversified technology portfolio in current markets.")} />
        <QuickAction text="Eco-Logistics" onClick={() => setInput("Describe the benefits of circular logistics in modern supply chains.")} />
      </div>
    </div>
  );
}

function ChatMessage({ msg, index, playResponse }: { msg: Message, index: number, playResponse: (t: string) => void }) {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`flex gap-6 max-w-5xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center border transition-all duration-300 ${
        msg.role === 'user' 
          ? 'bg-slate-100 border-slate-200 text-slate-400' 
          : 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
      }`}>
        {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      <div className={`flex-1 space-y-4 ${msg.role === 'user' ? 'max-w-[80%]' : ''}`}>
        <div className={`flex items-center gap-3 opacity-30 text-[9px] font-mono uppercase tracking-widest ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
          <span className="font-bold">{msg.role === 'user' ? 'Operator' : 'Zoya'}</span>
          <div className="w-px h-2 bg-current" />
          <span>REF_{index.toString().padStart(4, '0')}</span>
          {msg.role !== 'user' && (
            <button 
              onClick={() => playResponse(msg.parts.map((p: any) => p.text).join(''))}
              className="p-1 hover:text-indigo-600 transition-colors pointer-events-auto cursor-pointer"
              title="Read Aloud"
            >
              <Volume2 className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className={`markdown-body w-full p-6 text-sm ${
          msg.role === 'user' 
            ? 'bg-white rounded-3xl border border-slate-200 shadow-sm text-slate-700' 
            : 'bg-indigo-50 border border-indigo-100 rounded-3xl text-indigo-950 font-medium'
        }`}>
          {msg.parts.some(p => p.inlineData) && (
            <div className="mb-4 space-y-2">
              {msg.parts.filter(p => p.inlineData).map((p, idx) => (
                <img 
                  key={idx}
                  src={`data:${p.inlineData?.mimeType};base64,${p.inlineData?.data}`} 
                  alt="Contextual reference" 
                  className="max-w-sm rounded-xl border border-slate-200 shadow-sm"
                  referrerPolicy="no-referrer"
                />
              ))}
            </div>
          )}
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {msg.parts.map(p => p.text).join('')}
          </ReactMarkdown>
          {msg.role === 'model' && msg.parts[0].text === '' && (
            <div className="flex gap-1.5 mt-4">
              {[0, 0.2, 0.4].map(delay => (
                <motion.div 
                  key={delay}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} 
                  transition={{ repeat: Infinity, duration: 1, delay }} 
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400" 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ChatInput({ 
  input, 
  setInput, 
  handleSubmit, 
  isStreaming, 
  fileInputRef, 
  handleImageSelect, 
  selectedImage, 
  setSelectedImage,
  isSpeaking,
  continuousMode,
  setContinuousMode,
  voiceSettings,
  isListening,
  startListening,
  stopListening
}: any) {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {selectedImage && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative inline-block ml-4">
          <div className="p-1 bg-white rounded-2xl border border-slate-200 shadow-xl">
            <img src={selectedImage.url} alt="Selection" className="h-20 w-20 object-cover rounded-xl" />
          </div>
          <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-1.5 shadow-xl border-2 border-white hover:scale-110 transition-transform">
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="relative group flex items-center space-x-3">
        <div className="flex-1 relative">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-600 transition-colors hover:bg-slate-50 rounded-xl"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Ask Zoya anything..."}
            className={`w-full h-14 bg-white border border-slate-200 rounded-2xl pl-14 pr-24 shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 text-sm transition-all text-slate-700 ${isListening ? 'ring-2 ring-indigo-500/50' : ''}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={isStreaming}
          />
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setContinuousMode(!continuousMode)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                continuousMode ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'
              }`}
              title="Continuous Conversation Mode"
            >
              <Zap className={`w-4 h-4 ${continuousMode ? 'animate-pulse' : ''}`} />
            </button>
            <button
              type="button"
              onClick={isListening ? stopListening : () => startListening(voiceSettings.language)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              type="submit"
              disabled={(!input.trim() && !selectedImage) || isStreaming}
              className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 disabled:opacity-30 disabled:shadow-none transition-all hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
      <div className="px-6 flex justify-between items-center opacity-30 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
        <span>Zoya Session Active</span>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse"/> Encryption Enabled</span>
          <span>v2.5.0</span>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ text, onClick }: { text: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className="p-5 bg-white border border-slate-200 rounded-2xl text-left hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group flex items-center justify-between shadow-sm hover:shadow-md">
      <span className="text-xs font-semibold text-slate-500 group-hover:text-indigo-700 transition-colors tracking-tight">{text}</span>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" />
    </button>
  );
}

