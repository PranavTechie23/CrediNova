import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from 'recharts';
import { CheckCircle, BrainCircuit, Sparkles } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const radarData = [
  { subject: 'Income', applicant: 120, benchmark: 110, fullMark: 150 },
  { subject: 'Stability', applicant: 98, benchmark: 130, fullMark: 150 },
  { subject: 'Debt Control', applicant: 86, benchmark: 130, fullMark: 150 },
  { subject: 'Credit History', applicant: 99, benchmark: 100, fullMark: 150 },
  { subject: 'Alt Signals', applicant: 140, benchmark: 90, fullMark: 150 },
  { subject: 'Usage', applicant: 110, benchmark: 85, fullMark: 150 },
];

const waterfallData = [
  { name: 'Baseline PD', range: [0, 5.2], color: '#38BDF8' },
  { name: 'UPI Volume', range: [3.5, 5.2], color: '#00E599' },
  { name: 'Utility Delinq', range: [3.5, 4.8], color: '#FF4D6A' },
  { name: 'E-commerce', range: [4.1, 4.8], color: '#00E599' },
  { name: 'Credit Util', range: [4.1, 5.4], color: '#FF4D6A' },
  { name: 'Inc Stability', range: [3.8, 5.4], color: '#00E599' },
  { name: 'Final PD', range: [0, 3.8], color: '#38BDF8' },
];

export default function Explainability() {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [exportFilename, setExportFilename] = useState('explainability-snapshot');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf' | 'all'>('json');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  function sanitizeFilename(name: string) {
    if (!name || typeof name !== 'string') return 'snapshot';
    const cleaned = name.replace(/[^a-zA-Z0-9_. -]/g, '').trim();
    return cleaned.length ? cleaned : 'snapshot';
  }

  function showToast(message: string, ms = 3000) {
    setToast({ message, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), ms);
  }
  // Convert ranges to stacked values for a waterfall-style bar chart
  const waterfallChart = waterfallData.map((d) => ({
    name: d.name,
    start: d.range[0],
    value: +(d.range[1] - d.range[0]).toFixed(2),
    color: d.color,
  }));

  // Export helpers: prepare JSON and CSV snapshots for audits
  function prepareSnapshot() {
    return {
      metadata: {
        page: 'Explainability',
        generatedAt: new Date().toISOString(),
      },
      executiveSummary: {
        text: `Applicant demonstrates strong alternative financial footprint; see recommendations.`,
      },
      radarData,
      waterfallData,
      waterfallChart,
    };
  }

  function downloadJSON(filename = 'explainability-snapshot.json') {
    const cleanName = sanitizeFilename(filename.replace(/\.json$/i, '')) + '.json';
    const data = prepareSnapshot();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = cleanName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${cleanName}`);
  }

  function downloadCSV(filename = 'explainability-snapshot.csv') {
    const cleanName = sanitizeFilename(filename.replace(/\.csv$/i, '')) + '.csv';
    const data = prepareSnapshot();
    let csv = '';
    csv += 'Radar Data\n';
    csv += 'subject,applicant,benchmark,fullMark\n';
    data.radarData.forEach((r: any) => {
      csv += `${r.subject},${r.applicant},${r.benchmark},${r.fullMark}\n`;
    });
    csv += '\nWaterfall Data\n';
    csv += 'name,start,end,color\n';
    data.waterfallData.forEach((w: any) => {
      csv += `${w.name},${w.range[0]},${w.range[1]},${w.color}\n`;
    });
    csv += `\nExecutive Summary\n"${data.executiveSummary.text}"\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = cleanName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${cleanName}`);
  }

  function exportSnapshotAll() {
    // export both JSON and CSV to give auditors options
    downloadJSON();
    setTimeout(() => downloadCSV(), 200);
  }

  async function exportPDF(filename = 'explainability-snapshot.pdf') {
    const node = document.getElementById('explainability-export-target');
    if (!node) return alert('Export target not found');
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      let imgData = previewDataUrl;
      if (!imgData) {
        const canvas = await html2canvas(node as HTMLElement, { scale: 2, useCORS: true });
        imgData = canvas.toDataURL('image/png');
      }

      const pdf = new jsPDF({ orientation: 'landscape' });
      const imgProps: any = pdf.getImageProperties(imgData as string);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData as string, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const cleanName = sanitizeFilename(filename.replace(/\.pdf$/i, '')) + '.pdf';
      pdf.save(cleanName);
      showToast(`Downloaded ${cleanName}`);
    } catch (err) {
       
      alert('PDF export requires installing `jspdf` and `html2canvas`. Run: npm install jspdf html2canvas');
    }
  }

  async function generatePreview() {
    const node = document.getElementById('explainability-export-target');
    if (!node) return alert('Export target not found');
    setIsGeneratingPreview(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(node as HTMLElement, { scale: 1.5, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      setPreviewDataUrl(imgData);
    } catch (err) {
       
      alert('Preview generation requires html2canvas. Run: npm install html2canvas');
    } finally {
      setIsGeneratingPreview(false);
    }
  }

  // Accessibility: focus filename input when modal opens and close on Escape
  const filenameRef = React.useRef<HTMLInputElement | null>(null);
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setExportModalOpen(false);
    }
    if (exportModalOpen) {
      document.addEventListener('keydown', onKey);
      setTimeout(() => filenameRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('keydown', onKey);
  }, [exportModalOpen]);

  return (
    <div className="min-h-screen p-8 text-text-primary animate-fade-in bg-gradient-to-br from-background via-background to-surface-2">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Toast */}
        {toast.visible && (
          <div className="fixed top-6 right-6 z-60">
            <div className="px-4 py-2 bg-surface border border-border rounded-lg shadow-md text-sm">{toast.message}</div>
          </div>
        )}
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <PageHeader
            title="SHAP Deep Dive"
            subtitle="Explainability"
            description="Interactive SHAP explanations and feature contribution analysis for loan applicants."
            icon={<BrainCircuit className="w-7 h-7 text-white" />}
            actions={
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="sm" onClick={() => setExportModalOpen(true)}>
                  Export Snapshot
                </Button>
                <Button variant="ghost" size="sm">Share</Button>
              </div>
            }
          />
        </motion.div>

        {/* Business-facing context */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="mb-6">
            <CardContent className="p-6 flex flex-col md:flex-row items-start gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Why this matters for Risk Officers</h3>
                <p className="text-sm text-text-muted mt-2">This view translates technical SHAP outputs into business actions and compliance evidence.</p>
                <ul className="mt-4 space-y-3 text-sm">
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-success mt-1" /> <span><strong>Regulatory Auditability:</strong> Feature-level contributions provide an auditable decision trail for regulators and internal compliance reviews.</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-primary mt-1" /> <span><strong>Actionable Recommendations:</strong> Clear remediation items (e.g., lower DTI, clear utility delinquencies) you can surface to applicants or collections teams.</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-accent mt-1" /> <span><strong>Explainable Overrides:</strong> Quickly justify manual overrides with feature context and impact on PD for governance logs.</span></li>
                  <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-warning mt-1" /> <span><strong>Risk Calibration:</strong> See how changing thresholds will move portfolio-level PD and approval rates.</span></li>
                </ul>
              </div>
              <div className="w-full md:w-64">
                <div className="p-4 rounded-lg bg-surface border border-border text-sm">
                  <p className="font-semibold">Quick Tips</p>
                  <ol className="mt-2 text-xs space-y-2 list-decimal list-inside text-text-muted">
                    <li>Use the waterfall to explain the single biggest driver to a loan officer.</li>
                    <li>Attach the SHAP snapshot to the applicant's file for audits.</li>
                    <li>Prioritize remediation steps with highest PD impact.</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {exportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setExportModalOpen(false)} />
            <div className="relative bg-surface border border-border rounded-2xl p-6 w-full max-w-md z-10">
              <h3 className="text-lg font-bold mb-2">Export Snapshot</h3>
              <p className="text-sm text-text-muted mb-4">Choose an export format to attach to an audit or applicant file.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label id="export-filename-label" className="text-xs text-text-muted">Filename</label>
                    <input
                      ref={filenameRef}
                      aria-labelledby="export-filename-label"
                      id="export-filename"
                      className="w-full rounded-md border px-3 py-2"
                      value={exportFilename}
                      onChange={(e) => setExportFilename(e.target.value)}
                    />
                  <label className="text-xs text-text-muted mt-3 block">Format</label>
                  <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value as any)} className="mt-1 w-full rounded border border-border px-3 py-2 bg-surface text-sm">
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="pdf">PDF</option>
                    <option value="all">All (JSON + CSV)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <Button aria-label="Download JSON" variant="default" onClick={() => { downloadJSON(`${exportFilename}.json`); setExportModalOpen(false); }}>Download JSON</Button>
                  <Button aria-label="Download CSV" variant="secondary" onClick={() => { downloadCSV(`${exportFilename}.csv`); setExportModalOpen(false); }}>Download CSV</Button>
                  <Button aria-label="Export PDF" variant="accent" onClick={async () => { await exportPDF(`${exportFilename}.pdf`); setExportModalOpen(false); }}>Export PDF</Button>
                  <Button aria-label="Download selected format" variant="outline" onClick={() => {
                    if (exportFormat === 'json') downloadJSON(`${exportFilename}.json`);
                    else if (exportFormat === 'csv') downloadCSV(`${exportFilename}.csv`);
                    else if (exportFormat === 'pdf') exportPDF(`${exportFilename}.pdf`);
                    else { downloadJSON(`${exportFilename}.json`); setTimeout(() => downloadCSV(`${exportFilename}.csv`), 200); }
                    setExportModalOpen(false);
                  }}>Download</Button>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Button aria-label="Generate preview" variant="outline" onClick={generatePreview}>
                  {isGeneratingPreview ? 'Generating…' : 'Generate Preview'}
                </Button>
                <div className="text-xs text-text-muted">Generate a preview image of the report before exporting PDF.</div>
              </div>
              {previewDataUrl && (
                <div className="mt-4 border border-border rounded overflow-hidden">
                  <div className="text-xs p-2 bg-surface border-b border-border text-text-muted">Preview</div>
                  <div className="max-h-72 overflow-auto bg-white/5 p-2">
                    <img src={previewDataUrl} alt="Preview" className="max-w-full block mx-auto" />
                  </div>
                </div>
              )}
              <div className="mt-4 text-xs text-text-muted">PDF export requires `jspdf` and `html2canvas` (npm install jspdf html2canvas).</div>
            </div>
          </div>
        )}

        {/* Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-3xl" aria-hidden />
              <CardContent className="p-8">
                <CardTitle className="text-2xl">Behavioral Profile</CardTitle>
                <CardDescription>Applicant vs. Benchmark Portfolio</CardDescription>
                <div className="h-[320px] w-full mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="rgb(var(--border))" strokeOpacity={0.3} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgb(var(--text-muted))', fontSize: 11, fontWeight: 500 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                      <Radar name="Applicant" dataKey="applicant" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.3} strokeWidth={2.5} />
                      <Radar name="Benchmark" dataKey="benchmark" stroke="#7B61FF" fill="transparent" strokeDasharray="6 4" strokeWidth={2} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: '8px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-8 mt-6 text-xs font-semibold">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary rounded-full opacity-60 shadow-md shadow-primary/30" aria-hidden></div><span className="text-text-muted">Applicant</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-dashed border-accent rounded-full" aria-hidden></div><span className="text-text-muted">Benchmark</span></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Narrative */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-accent/10 via-primary/5 to-transparent border-accent/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" aria-hidden />
              <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-gradient-to-br from-accent to-primary rounded-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl">Executive Summary</CardTitle>
                    </div>
                <div className="space-y-5 text-sm text-text-secondary leading-relaxed font-medium">
                  <p className="p-4 rounded-lg bg-success/5 border border-success/20 text-text-primary">
                    The applicant demonstrates a <span className="text-primary font-bold">strong alternative financial footprint</span>, primarily driven by consistent UPI transaction volume which offset their relatively short traditional credit history.
                  </p>
                  <p className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                    While utility delinquencies raised baseline risk temporarily <span className="font-mono text-warning">(+1.3% PD)</span>, their e-commerce purchasing behavior and regular income deposits significantly reduced the overall risk profile <span className="font-mono text-success">(-1.6% PD)</span>.
                  </p>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="font-bold text-primary mb-1">Recommendation:</p>
                    <p>Excellent candidate for micro-credit expansion with high likelihood of repayment despite lacking traditional FICO footprint.</p>
                  </div>
                </div>
                
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Row 2 - Waterfall */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface/60 border border-border/50 rounded-2xl p-8 card-hover">
          <h3 className="text-2xl font-bold font-sora mb-3 text-text-primary">Feature Contribution Analysis</h3>
          <p className="text-sm text-text-muted mb-10">SHAP values: How each feature moved the Probability of Default from baseline (5.2%) to final (3.8%)</p>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={waterfallChart}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="rgb(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgb(var(--text-muted))" fontSize={12} tickFormatter={(val) => `${val}%`} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
                <Bar dataKey="start" stackId="a" fill="rgba(0,0,0,0)" />
                <Bar dataKey="value" stackId="a" radius={6}>
                  {waterfallData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <ReferenceLine y={5.2} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Baseline 5.2%', position: 'right', fill: 'rgb(var(--text-muted))' }} />
                <ReferenceLine y={3.8} stroke="#60a5fa" strokeDasharray="4 4" label={{ value: 'Final 3.8%', position: 'right', fill: 'rgb(var(--text-muted))' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-2 border border-border rounded-xl p-6">
            <h3 className="text-xl font-semibold font-sora mb-6">What-If Scenarios</h3>
            <div className="space-y-4">
              <div className="p-4 bg-surface border border-border rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium">If income_stability increases to 85</span>
                <span className="px-2 py-1 bg-success/10 text-success text-xs font-mono rounded border border-success/20">Score +47</span>
              </div>
              <div className="p-4 bg-surface border border-border rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium">If past_delinquencies = 0</span>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-mono rounded border border-primary/20">Tier shifts to Low</span>
              </div>
              <div className="p-4 bg-surface border border-border rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium">If EMI reduced by 20%</span>
                <span className="px-2 py-1 bg-success/10 text-success text-xs font-mono rounded border border-success/20">PD drops to 2.1%</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-2 border border-border rounded-xl p-6">
            <h3 className="text-xl font-semibold font-sora mb-6">Improvement Suggestions</h3>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Pay off 2 pending EMIs</h4>
                  <p className="text-xs text-text-muted mt-1">This will reduce DTI below the critical 0.35 threshold.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Maintain utility bill consistency</h4>
                  <p className="text-xs text-text-muted mt-1">3 months of no missed payments will clear the penalty.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5">
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Reduce outstanding balance</h4>
                  <p className="text-xs text-text-muted mt-1">Keep credit utilization below 60% for maximum score bump.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
