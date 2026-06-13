import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { GitCompare, TrendingUp, TrendingDown, HelpCircle, Sparkles, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function Compare() {
  const [reports, setReports] = useState<any[]>([]);
  const [reportId1, setReportId1] = useState<string>('');
  const [reportId2, setReportId2] = useState<string>('');
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, language, direction } = useLanguage();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/reports/');
        setReports(res.data);
      } catch (err) {
        console.error(err);
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportId1 || !reportId2) {
      setError(t('compare.infoPrompt'));
      return;
    }
    if (reportId1 === reportId2) {
      setError(t('compare.sameReportError'));
      return;
    }

    setComparing(true);
    setError(null);
    setComparison(null);

    try {
      const res = await api.post('/reports/compare', {
        report_id_1: parseInt(reportId1),
        report_id_2: parseInt(reportId2),
      });
      setComparison(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || t('common.error'));
    } finally {
      setComparing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-slate-800 border-t-brand-cyan rounded-full animate-spin"></div>
        <div className="text-slate-400 text-sm font-semibold tracking-wider uppercase animate-pulse">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800/60 pb-6">
        <div className="space-y-1">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2 group transition-colors">
            <ArrowLeft size={12} className={`transition-transform ${direction === 'rtl' ? 'group-hover:translate-x-0.5' : 'group-hover:-translate-x-0.5'}`} /> {t('nav.dashboard')}
          </Link>
          <h1 className="text-2xl font-black text-white">{t('compare.title')}</h1>
          <p className="text-slate-400 text-xs font-medium">{t('compare.subtitle')}</p>
        </div>
      </div>

      {/* Main Form */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-30%] left-[-30%] w-[60%] h-[60%] bg-brand-indigo/5 rounded-full blur-[100px] pointer-events-none"></div>

        {error && (
          <div className="mb-6 bg-brand-rose/10 border border-brand-rose/25 text-brand-rose text-sm rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCompare} className="grid grid-cols-1 md:grid-cols-3 items-end gap-6 relative z-10">
          {/* Report 1 Selection */}
          <div className="space-y-2">
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider">{t('compare.olderLabel')}</label>
            <select
              value={reportId1}
              onChange={(e) => setReportId1(e.target.value)}
              className="w-full bg-brand-dark border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:border-brand-indigo/80 focus:ring-1 focus:ring-brand-indigo outline-none transition-all"
            >
              <option value="">{t('compare.selectPlaceholder')}</option>
              {reports.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.filename} ({new Date(report.uploaded_at).toLocaleDateString(language)})
                </option>
              ))}
            </select>
          </div>

          {/* Separation indicator */}
          <div className="hidden md:flex justify-center items-center pb-4 text-slate-600">
            <GitCompare className="h-6 w-6 animate-pulse" />
          </div>

          {/* Report 2 Selection */}
          <div className="space-y-2">
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider">{t('compare.newerLabel')}</label>
            <select
              value={reportId2}
              onChange={(e) => setReportId2(e.target.value)}
              className="w-full bg-brand-dark border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:border-brand-cyan/85 focus:ring-1 focus:ring-brand-cyan outline-none transition-all"
            >
              <option value="">{t('compare.selectPlaceholder')}</option>
              {reports.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.filename} ({new Date(report.uploaded_at).toLocaleDateString(language)})
                </option>
              ))}
            </select>
          </div>

          {/* Run comparison button */}
          <div className="md:col-span-3 flex justify-end mt-4">
            <button
              type="submit"
              disabled={comparing || !reportId1 || !reportId2}
              className="w-full sm:w-auto bg-gradient-to-r from-brand-indigo to-brand-cyan text-brand-dark font-black py-3.5 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-brand-indigo/15 hover:shadow-brand-indigo/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
            >
              {comparing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {t('compare.comparingBtn')}
                </>
              ) : (
                <>
                  <GitCompare size={16} />
                  {t('compare.compareBtn')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Comparison Loading State */}
      {comparing && (
        <div className="glass-card p-12 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center space-y-6 text-center animate-fade-in">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-slate-800 border-t-brand-indigo rounded-full animate-spin"></div>
            <Sparkles size={20} className="absolute text-brand-indigo animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-slate-200 font-bold text-base">{t('compare.comparingBtn')}</h3>
            <p className="text-slate-500 text-xs">{t('upload.processingSub')}</p>
          </div>
        </div>
      )}

      {/* Results View */}
      {comparison && (
        <div className="space-y-8 animate-fade-in">
          {/* Main AI Summary Card */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-brand-indigo/20 transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-indigo/5 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-2.5 mb-4 relative z-10">
              <div className="bg-brand-indigo/15 p-2 rounded-xl text-brand-indigo">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <h2 className="text-lg font-bold text-white">{t('compare.aiSummary')}</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed relative z-10 whitespace-pre-line">
              {comparison.ai_summary}
            </p>
          </div>

          {/* Metric Trends Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Worsened Metrics */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-brand-rose/20 transition-all duration-300 flex flex-col">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-800/60 pb-3">
                <div className="bg-brand-rose/10 p-1.5 rounded-lg text-brand-rose">
                  <TrendingDown className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-bold text-white">{t('compare.worsened')}</h3>
              </div>
              <div className="flex-1 space-y-2">
                {comparison.worsened_metrics && comparison.worsened_metrics.length > 0 ? (
                  comparison.worsened_metrics.map((metric: string, idx: number) => (
                    <div key={idx} className="bg-brand-rose/5 border border-brand-rose/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-rose shrink-0 mt-1.5"></span>
                      <span>{metric}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-xs py-6 text-center">{t('compare.emptyMetrics')}</div>
                )}
              </div>
            </div>

            {/* Improved Metrics */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-brand-emerald/20 transition-all duration-300 flex flex-col">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-800/60 pb-3">
                <div className="bg-brand-emerald/10 p-1.5 rounded-lg text-brand-emerald">
                  <TrendingUp className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-bold text-white">{t('compare.improved')}</h3>
              </div>
              <div className="flex-1 space-y-2">
                {comparison.improved_metrics && comparison.improved_metrics.length > 0 ? (
                  comparison.improved_metrics.map((metric: string, idx: number) => (
                    <div key={idx} className="bg-brand-emerald/5 border border-brand-emerald/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald shrink-0 mt-1.5"></span>
                      <span>{metric}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-xs py-6 text-center">{t('compare.emptyMetrics')}</div>
                )}
              </div>
            </div>

            {/* Stable Metrics */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-brand-cyan/20 transition-all duration-300 flex flex-col">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-800/60 pb-3">
                <div className="bg-brand-cyan/10 p-1.5 rounded-lg text-brand-cyan">
                  <HelpCircle className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-bold text-white">{t('compare.stable')}</h3>
              </div>
              <div className="flex-1 space-y-2">
                {comparison.stable_metrics && comparison.stable_metrics.length > 0 ? (
                  comparison.stable_metrics.map((metric: string, idx: number) => (
                    <div key={idx} className="bg-brand-cyan/5 border border-brand-cyan/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan shrink-0 mt-1.5"></span>
                      <span>{metric}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-xs py-6 text-center">{t('compare.emptyMetrics')}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
