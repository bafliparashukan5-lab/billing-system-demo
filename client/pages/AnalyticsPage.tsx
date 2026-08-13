import React, { useState, useEffect } from 'react';
import { Sparkles, Zap } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
            <span>Business Intelligence & AI Insights Engine</span>
            <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded border border-purple-500/30">Section 26 & 35</span>
          </h1>
          <p className="text-xs text-slate-400">Smart AI recommendations: Dead stock prediction, margin optimization, reorder forecast & overdue risk detection.</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Active AI Recommendation Feed</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(analytics?.aiInsights || []).map((insight: any, idx: number) => (
            <div key={idx} className="glass-panel p-5 rounded-2xl border border-purple-500/30 space-y-2 bg-gradient-to-b from-purple-950/20 to-slate-900">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase">{insight.type}</span>
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <h4 className="font-bold text-sm text-slate-100">{insight.title}</h4>
              <p className="text-xs text-slate-400">{insight.description}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
