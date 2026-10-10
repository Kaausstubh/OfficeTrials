import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Task } from '../types';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Calendar,
  Plus,
  ShieldAlert,
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/cases');
      const allTasks: any[] = [];
      res.data.data.forEach((c: any) => {
        c.tasks?.forEach((t: any) =>
          allTasks.push({ ...t, caseNumber: c.caseNumber, caseTitle: c.title })
        );
      });
      setTasks(allTasks);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="font-serif font-bold text-2xl text-navy-dark tracking-tight">
          Litigation Tasks & Limitation Deadlines
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Hearing preparation checklists, drafting deadlines, and statutory appeal/revision limitation calculations
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No open tasks recorded.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map(t => {
              const isOverdue = new Date(t.dueDate) < new Date();
              return (
                <div
                  key={t.id}
                  onClick={() => navigate(`/cases/${t.caseId}`)}
                  className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{t.title}</span>
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        {t.caseNumber}
                      </span>
                      {t.priority === 'URGENT' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          URGENT
                        </span>
                      )}
                    </div>
                    {t.description && (
                      <p className="text-slate-600 text-[11px]">{t.description}</p>
                    )}
                    <div className="text-slate-500 text-[10px]">
                      Assigned to: <strong>{t.assignedTo?.fullName || 'Chambers'}</strong>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[11px] font-mono font-bold block ${
                        isOverdue ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {isOverdue ? '⚠️ Overdue: ' : 'Due: '}
                      {new Date(t.dueDate).toLocaleDateString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500">{t.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
