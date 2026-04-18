import { useState } from 'react';
import { FileText, Download, Copy } from 'lucide-react';
import { useMachineContext } from '../App';
import { generateReport } from '../services/claudeService';
import jsPDF from 'jspdf';
import ToastNotification from '../components/shared/ToastNotification';

const ReportGeneratorPage = () => {
  const [selectedMachine, setSelectedMachine] = useState('CNC_01');
  const [reportType, setReportType] = useState('Incident Report');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRCA, setIncludeRCA] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [toast, setToast] = useState(null);

  const { latestReadings, machines, alerts, machineIds } = useMachineContext();

  const handleGenerate = async () => {
    setLoading(true);
    setReport(null);

    const machineAlerts = alerts.filter(a => a.machine_id === selectedMachine);
    const sensorSummary = {
      temperature: latestReadings[selectedMachine]?.temperature_C,
      vibration: latestReadings[selectedMachine]?.vibration_mm_s,
      rpm: latestReadings[selectedMachine]?.rpm,
      current: latestReadings[selectedMachine]?.current_A
    };

    const response = await generateReport(
      selectedMachine,
      machines[selectedMachine]?.label,
      reportType,
      machineAlerts,
      sensorSummary,
      {}
    );

    setLoading(false);

    if (response.error) {
      setToast({ message: response.error, type: 'error' });
    } else {
      setReport(response.report);
      setToast({ message: 'Report generated successfully', type: 'success' });
    }
  };

  const handleDownloadPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    const lines = doc.splitTextToSize(report, 180);
    
    doc.setFontSize(12);
    let y = 20;
    
    lines.forEach(line => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 15, y);
      y += 7;
    });

    doc.save(`${selectedMachine}_${reportType.replace(/\s+/g, '_')}.pdf`);
    setToast({ message: 'PDF downloaded', type: 'success' });
  };

  const handleDownloadTXT = () => {
    if (!report) return;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedMachine}_${reportType.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ message: 'TXT downloaded', type: 'success' });
  };

  const handleCopy = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
    setToast({ message: 'Copied to clipboard', type: 'success' });
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <FileText size={32} className="text-primary" />
          <div>
            <h1 className="font-display font-bold text-textPrimary text-2xl">Maintenance Report Generator</h1>
            <p className="text-textMuted">Generate professional maintenance reports with AI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Config */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="font-display font-semibold text-textPrimary text-lg mb-4">Report Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Machine</label>
                <select
                  value={selectedMachine}
                  onChange={(e) => setSelectedMachine(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-textPrimary focus:outline-none focus:border-primary"
                >
                  {machineIds.map(id => (
                    <option key={id} value={id}>
                      {machines[id]?.label} ({id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-textPrimary focus:outline-none focus:border-primary"
                >
                  <option>Incident Report</option>
                  <option>Scheduled Maintenance</option>
                  <option>Predictive Analysis</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-textPrimary">Include Sensor Charts</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeRCA}
                    onChange={(e) => setIncludeRCA(e.target.checked)}
                    className="w-4 h-4 rounded border-surfaceBorder text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-textPrimary">Include RCA Findings</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeRecommendations}
                    onChange={(e) => setIncludeRecommendations(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-textPrimary">Include Recommendations</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1 py-3 bg-primary text-background font-semibold rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Report'
                  )}
                </button>
                <button
                  onClick={() => {
                    setReport(null);
                  }}
                  className="px-6 py-3 bg-gray-200 text-textPrimary rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="font-display font-semibold text-textPrimary text-lg mb-4">Report Preview</h2>
            
            {loading && (
              <div className="flex flex-col items-center justify-center h-96 text-textMuted">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin mb-4" />
                <p>Generating professional report...</p>
              </div>
            )}

            {!loading && !report && (
              <div className="flex flex-col items-center justify-center h-96 text-textMuted">
                <FileText size={48} className="mb-4 opacity-50" />
                <p>Configure report settings and click Generate</p>
              </div>
            )}

            {!loading && report && (
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-4 max-h-96 overflow-y-auto scrollbar-thin">
                  <pre className="text-sm text-textPrimary whitespace-pre-wrap font-mono">
                    {report}
                  </pre>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/80 transition-colors"
                  >
                    <Download size={16} />
                    PDF
                  </button>
                  <button
                    onClick={handleDownloadTXT}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-textPrimary rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <Download size={16} />
                    TXT
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-textPrimary rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <Copy size={16} />
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <ToastNotification
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ReportGeneratorPage;
