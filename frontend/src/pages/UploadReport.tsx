import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UploadCloud, FileText, ArrowLeft, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UploadReport() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(0); // 0: idle, 1: uploading, 2: ocr, 3: ai analysis
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setStep(1);

    // Simulate multi-step progress for better UX
    const timer1 = setTimeout(() => setStep(2), 2000);
    const timer2 = setTimeout(() => setStep(3), 6000);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      clearTimeout(timer1);
      clearTimeout(timer2);
      setStep(4);
      setTimeout(() => {
        navigate(`/analysis/${res.data.id}`);
      }, 1000);
    } catch (err) {
      console.error(err);
      clearTimeout(timer1);
      clearTimeout(timer2);
      alert('Failed to upload file');
      setUploading(false);
      setStep(0);
    }
  };

  const steps = [
    "Uploading report to server...",
    "Extracting laboratory text & values (OCR)...",
    "Running AI biomarker trend analyzer...",
    "Analysis completed!"
  ];

  return (
    <div className="max-w-2xl mx-auto mt-6 pb-10">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs font-semibold uppercase tracking-wider mb-6 group transition-colors">
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
      </Link>

      <div className="glass-card p-8 rounded-2xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
        {/* Ambient background glow inside card */}
        <div className="absolute top-[-40%] left-[-40%] w-[80%] h-[80%] bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none"></div>

        <h1 className="text-2xl font-black text-white relative z-10">Upload Medical Report</h1>
        <p className="text-slate-400 text-sm mt-1 mb-8 relative z-10">
          Upload PDF, PNG, or JPG lab results for AI data extraction and trend plotting.
        </p>

        {uploading ? (
          <div className="py-12 flex flex-col items-center justify-center relative z-10 space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-slate-800 border-t-brand-cyan rounded-full animate-spin"></div>
              <Sparkles size={20} className="absolute text-brand-cyan animate-pulse" />
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="text-slate-200 font-bold text-base">Processing Report</h3>
              <p className="text-slate-500 text-xs">Please keep this page open. This may take up to a minute.</p>
            </div>

            <div className="w-full max-w-md bg-slate-950/60 p-5 rounded-2xl border border-slate-800/50 space-y-4">
              {steps.map((text, idx) => {
                const stepNum = idx + 1;
                const isCompleted = step > stepNum;
                const isCurrent = step === stepNum;
                return (
                  <div key={idx} className="flex items-center gap-3 transition-opacity">
                    {isCompleted ? (
                      <CheckCircle2 size={16} className="text-brand-emerald shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 size={16} className="text-brand-cyan animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-800 shrink-0" />
                    )}
                    <span className={`text-xs font-semibold ${isCurrent ? 'text-brand-cyan' : isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
                      {text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="relative z-10">
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all relative ${
                dragActive 
                  ? 'border-brand-cyan bg-brand-cyan/5 shadow-glow-cyan' 
                  : 'border-slate-800/80 bg-slate-900/10 hover:bg-slate-900/30 hover:border-slate-700/80'
              }`}
            >
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={e => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.png,.jpg,.jpeg"
              />
              <div className="bg-slate-900/50 p-4 rounded-full border border-slate-800 w-16 h-16 flex items-center justify-center mx-auto mb-4 text-brand-cyan shadow-lg">
                <UploadCloud className="h-7 w-7" />
              </div>
              
              {file ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-brand-cyan font-bold text-sm">
                    <FileText className="h-5 w-5" />
                    {file.name}
                  </div>
                  <p className="text-slate-500 text-xs font-medium">Selected file size: {(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-slate-200 font-bold text-sm mb-1">Click or drag a file to upload</p>
                  <p className="text-slate-500 text-xs">PDF, PNG, JPEG up to 10MB</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                type="submit" 
                disabled={!file}
                className="w-full sm:w-auto bg-gradient-to-r from-brand-indigo to-brand-cyan text-brand-dark font-bold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-brand-cyan/15 hover:shadow-brand-cyan/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
              >
                Upload & Start Analysis
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

