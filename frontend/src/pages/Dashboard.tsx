import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Activity, HeartPulse, AlertCircle, Calendar, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-navy/95 border border-slate-700/80 p-4 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-slate-400 text-xs font-semibold mb-2">{label}</p>
        {payload.map((pld: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pld.color }}></span>
            <span className="text-slate-200 text-xs font-medium">{pld.name}:</span>
            <span className="text-slate-100 text-xs font-bold">{pld.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setData((prev: any) => prev || { health_score: 85, urgency: "Normal", recent_reports: [], trends: [] }); // Fallback mock
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-slate-800 border-t-brand-cyan rounded-full animate-spin"></div>
        <div className="text-slate-400 text-sm font-semibold tracking-wider uppercase animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  const hasTrends = data?.trends && data.trends.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-brand-cyan">
            Health Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time analytics and AI interpretations of your medical history.
          </p>
        </div>
        <Link 
          to="/upload" 
          className="bg-gradient-to-r from-brand-indigo to-brand-cyan text-brand-dark font-bold px-5 py-3 rounded-xl hover:shadow-glow-cyan transition-all duration-300 flex items-center gap-2 text-sm"
        >
          <Zap size={16} /> Upload New Report
        </Link>
      </div>

      {/* High Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health Score */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-brand-indigo/35 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-indigo/5 rounded-full blur-2xl group-hover:bg-brand-indigo/10 transition-all"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-brand-indigo/10 p-4 rounded-2xl text-brand-indigo group-hover:scale-105 transition-transform shadow-inner">
              <HeartPulse className="h-7 w-7" />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Health Score</div>
              <div className="text-3xl font-black text-white mt-1">
                {data?.health_score || '--'}<span className="text-slate-500 text-sm font-normal">/100</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Urgency */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-brand-rose/25 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-rose/5 rounded-full blur-2xl group-hover:bg-brand-rose/10 transition-all"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-brand-rose/10 p-4 rounded-2xl text-brand-rose group-hover:scale-105 transition-transform shadow-inner">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Urgency Status</div>
              <div className="text-xl font-bold text-white mt-1.5 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${data?.ai_findings?.urgency === 'High' ? 'bg-brand-rose animate-ping' : 'bg-brand-emerald'}`}></span>
                {data?.ai_findings?.urgency || 'Normal'}
              </div>
            </div>
          </div>
        </div>

        {/* Reports Count */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-brand-cyan/35 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/5 rounded-full blur-2xl group-hover:bg-brand-cyan/10 transition-all"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-brand-cyan/10 p-4 rounded-2xl text-brand-cyan group-hover:scale-105 transition-transform shadow-inner">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Files Analyzed</div>
              <div className="text-3xl font-black text-white mt-1">
                {data?.recent_reports?.length || 0} <span className="text-slate-500 text-xs font-normal lowercase">records</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary Section */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-slate-800 transition-all duration-300 relative">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Activity size={18} className="text-brand-cyan" /> Latest AI Medical Summary
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed max-w-4xl">
          {data?.ai_findings?.summary || "No health history found. Upload a medical report to generate a comprehensive health timeline and summary."}
        </p>
      </div>

      {/* Health Trend Visualization */}
      {hasTrends && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-slate-800 transition-all duration-300">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Activity size={18} className="text-brand-indigo" /> Biomarker Trends Over Time
          </h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCholesterol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Glucose" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGlucose)" />
                <Area type="monotone" dataKey="Cholesterol" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCholesterol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Uploads Table */}
      <div className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden hover:border-slate-800 transition-all">
        <div className="p-6 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/40">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-brand-cyan" /> Recent Uploaded Records
          </h2>
        </div>
        <div className="divide-y divide-slate-800/60">
          {data?.recent_reports?.map((report: any) => (
            <div key={report.id} className="p-4 hover:bg-slate-900/20 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800 text-slate-400 shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200 text-sm">{report.filename}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{new Date(report.uploaded_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                </div>
              </div>
              <Link 
                to={`/analysis/${report.id}`} 
                className="text-brand-cyan hover:text-brand-cyan/85 font-semibold text-xs flex items-center gap-1 self-start sm:self-auto group transition-colors"
              >
                View Analytics <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          ))}
          {(!data?.recent_reports || data.recent_reports.length === 0) && (
            <div className="text-slate-500 text-sm py-10 text-center font-medium">
              No medical reports analyzed yet. Get started by uploading one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

