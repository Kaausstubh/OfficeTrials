import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  Shield,
  Briefcase,
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/cases');
      setCases(res.data.data);
      if (res.data.data.length > 0) {
        selectCase(res.data.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectCase = async (c: any) => {
    setSelectedCase(c);
    try {
      const res = await apiClient.get(`/cases/${c.id}/messages`);
      setMessages(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedCase) return;

    try {
      const res = await apiClient.post(`/cases/${selectedCase.id}/messages`, {
        messageText: newMsg,
      });
      setMessages(prev => [...prev, res.data.data]);
      setNewMsg('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col space-y-4">
      <div>
        <h2 className="font-serif font-bold text-2xl text-navy-dark tracking-tight">
          Case-Linked Advocate & Client Communication
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Encrypted litigation channels linked directly to corresponding court cases
        </p>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
        {/* Cases Sidebar */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col min-h-0">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
            Litigation Channels ({cases.length})
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {cases.map(c => (
              <div
                key={c.id}
                onClick={() => selectCase(c)}
                className={`p-3.5 cursor-pointer text-xs transition-colors ${
                  selectedCase?.id === c.id
                    ? 'bg-amber-50/60 font-semibold text-amber-900 border-l-3 border-amber-600'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold truncate">{c.caseNumber}</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{c.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        <div className="md:col-span-8 flex flex-col min-h-0">
          {selectedCase ? (
            <>
              {/* Thread Header */}
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{selectedCase.caseNumber}</span>
                  <span className="text-slate-500 ml-2">({selectedCase.title})</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {selectedCase.court?.name}
                </span>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    No messages in this case thread yet. Send a message below.
                  </div>
                ) : (
                  messages.map(m => {
                    const isSelf = m.senderId === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-lg p-3 rounded-xl text-xs ${
                            isSelf
                              ? 'bg-navy text-white rounded-br-xs'
                              : 'bg-slate-100 text-slate-900 rounded-bl-xs'
                          }`}
                        >
                          <div className="font-semibold text-[10px] opacity-80 mb-0.5">
                            {m.sender?.fullName} ({m.senderType})
                          </div>
                          <p className="leading-relaxed">{m.messageText}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-0.5 px-1 font-mono">
                          {new Date(m.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Send Form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex gap-2 bg-white">
                <input
                  type="text"
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  placeholder="Type message to client or assigned counsel..."
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={!newMsg.trim()}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-navy hover:bg-navy-light disabled:opacity-50 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              Select a litigation channel to view messages.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
