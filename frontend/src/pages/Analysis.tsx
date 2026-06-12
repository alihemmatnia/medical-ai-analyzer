import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { AlertCircle, CheckCircle, Activity, Stethoscope, ArrowLeft, MessageSquare, AlertTriangle } from 'lucide-react';

export default function Analysis() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportRes = await api.get(`/reports/${id}`);
        setReport(reportRes.data);
        
        if (!reportRes.data.analysis) {
          const analysisRes = await api.post(`/reports/${id}/analyze`);
          setAnalysis(analysisRes.data);
          
          // Re-fetch report to get lab values
          const updatedReportRes = await api.get(`/reports/${id}`);
          setReport(updatedReportRes.data);
        } else {
          setAnalysis(reportRes.data.analysis);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-6">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-slate-800 border-t-brand-cyan rounded-full animate-spin"></div>
          <Activity size={20} className="absolute text-brand-cyan animate-pulse" />
        </div>
        <div className="text-center space-y-1.5">
          <div className="text-slate-200 font-bold text-sm uppercase tracking-wider animate-pulse">Running Diagnostic AI...</div>
          <div className="text-slate-500 text-xs">Parsing lab panels, flagging biomarkers, and generating insights</div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center space-y-4">
        <AlertCircle className="mx-auto text-brand-rose h-12 w-12 animate-bounce" />
        <h2 className="text-xl font-bold text-white">Report Not Found</h2>
        <p className="text-slate-400 text-sm">We couldn't locate the requested analysis record.</p>
        <Link to="/" className="inline-block bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const urgencyColors: any = {
    "Normal": "bg-brand-emerald/10 text-brand-emerald border-brand-emerald/25 shadow-[0_0_12px_rgba(16,185,129,0.08)]",
    "Low": "bg-brand-amber/10 text-brand-amber border-brand-amber/25 shadow-[0_0_12px_rgba(245,158,11,0.08)]",
    "Medium": "bg-brand-rose/10 text-brand-amber border-brand-rose/25 shadow-[0_0_12px_rgba(244,63,94,0.08)]",
    "High": "bg-brand-rose/15 text-brand-rose border-brand-rose/30 shadow-[0_0_15px_rgba(244,63,94,0.15)] animate-pulse",
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800/60 pb-6">
        <div className="space-y-1">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2 group transition-colors">
            <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" /> Dashboard
          </Link>
          <h1 className="text-2xl font-black text-white">AI Diagnostic Insight</h1>
          <p className="text-slate-400 text-xs font-medium">Record: <span className="text-brand-cyan">{report.filename}</span></p>
        </div>
        
        <div className={`px-4.5 py-2 rounded-full border text-xs font-extrabold tracking-wider uppercase self-start sm:self-auto ${urgencyColors[analysis?.urgency] || urgencyColors["Normal"]}`}>
          Urgency: {analysis?.urgency || 'Normal'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Executive Summary */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-brand-indigo/35 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-indigo/5 rounded-full blur-xl"></div>
          <div className="flex items-center gap-2.5 mb-4 relative z-10">
            <div className="bg-brand-indigo/15 p-2 rounded-xl text-brand-indigo">
              <Activity className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-white">Executive Summary</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed relative z-10">{analysis?.summary}</p>
        </div>

        {/* Abnormal Findings */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-brand-rose/25 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-rose/5 rounded-full blur-xl"></div>
          <div className="flex items-center gap-2.5 mb-4 relative z-10">
            <div className="bg-brand-rose/15 p-2 rounded-xl text-brand-rose">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-white">Critical & Abnormal Findings</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed relative z-10">{analysis?.findings}</p>
        </div>
        
        {/* Extracted Lab Values Table */}
        <div className="glass-card rounded-2xl border border-slate-800/80 md:col-span-2 overflow-hidden hover:border-slate-800 transition-all duration-300">
          <div className="p-6 border-b border-slate-800/60 bg-slate-900/40 flex items-center gap-2.5">
            <div className="bg-brand-cyan/15 p-2 rounded-xl text-brand-cyan">
              <Stethoscope className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-white">Extracted Laboratory Values</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-800/60">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Test Parameter</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Result Value</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Reference Range</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {report.lab_values?.map((lab: any) => {
                  // Basic client-side highlights for values containing abnormal indicators (stars, high flags) or high values
                  const isOut = lab.test_name.toLowerCase().includes('*') || lab.value.toLowerCase().includes('*') || lab.value.toLowerCase().includes('h') || lab.value.toLowerCase().includes('l');
                  return (
                    <tr key={lab.id} className={`hover:bg-slate-900/30 transition-colors ${isOut ? 'bg-brand-rose/5' : ''}`}>
                      <td className="p-4 text-sm font-semibold text-slate-200 flex items-center gap-2">
                        {lab.test_name}
                        {isOut && <span className="px-2 py-0.5 text-[10px] font-extrabold bg-brand-rose/15 text-brand-rose border border-brand-rose/25 rounded-md uppercase tracking-wide">Alert</span>}
                      </td>
                      <td className={`p-4 text-sm font-extrabold ${isOut ? 'text-brand-rose' : 'text-slate-100'}`}>
                        {lab.value}
                      </td>
                      <td className="p-4 text-sm text-slate-400 font-medium">{lab.reference_range}</td>
                      <td className="p-4 text-sm text-slate-500 font-bold">{lab.unit}</td>
                    </tr>
                  );
                })}
                {(!report.lab_values || report.lab_values.length === 0) && (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-slate-500 text-sm font-medium">
                      No biomarker panels parsed in this document.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Link 
          to={`/chat?report_id=${id}`} 
          className="bg-gradient-to-r from-brand-indigo to-brand-cyan text-brand-dark font-black py-4 px-10 rounded-xl shadow-lg shadow-brand-indigo/15 hover:shadow-brand-indigo/30 transition-all duration-300 flex items-center gap-2.5 text-sm"
        >
          <MessageSquare size={18} /> Discuss Report Findings With Assistant
        </Link>
      </div>
    </div>
  );
}

