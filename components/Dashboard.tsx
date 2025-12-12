import React, { useState } from 'react';
import { Paper, ArchitectureType } from '../types';
import { ExtractionTable } from './ExtractionTable';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Download, Search, RefreshCw, Cpu, Layers, Globe, Calendar } from 'lucide-react';

interface Props {
  papers: Paper[];
  onAnalyze: (id: string) => void;
  onSearch: (url: string, startYear: number, endYear: number) => void;
  isSearching: boolean;
}

export const Dashboard: React.FC<Props> = ({ papers, onAnalyze, onSearch, isSearching }) => {
  const [url, setUrl] = useState("https://dblp.org/search?q=infrared%20small%20target%20streamid%3Ajournals%2Ftgrs%3A");
  const [startYear, setStartYear] = useState(2024);
  const [endYear, setEndYear] = useState(2025);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(url, startYear, endYear);
  };

  const analyzedCount = papers.filter(p => p.isAnalyzed).length;
  
  // Chart Data
  const archData = [
    { name: 'CNN', value: papers.filter(p => p.isAnalyzed && p.architecture === ArchitectureType.CNN).length },
    { name: 'Transformer', value: papers.filter(p => p.isAnalyzed && p.architecture === ArchitectureType.TRANSFORMER).length },
    { name: 'Hybrid', value: papers.filter(p => p.isAnalyzed && p.architecture === ArchitectureType.HYBRID).length },
  ].filter(d => d.value > 0);

  const COLORS = ['#3b82f6', '#8b5cf6', '#14b8a6'];

  const exportToCSV = () => {
    const headers = [
      "Title", "Year", "Authors", "Architecture", "Datasets", 
      "Split", "Annotation", "Metrics", "Results", "Innovation"
    ];
    const rows = papers.map(p => [
      `"${p.title.replace(/"/g, '""')}"`,
      p.year,
      `"${p.authors.join(', ')}"`,
      p.architecture,
      `"${p.datasets.join(', ')}"`,
      `"${p.dataSplit}"`,
      `"${p.annotationType}"`,
      `"${p.metrics.join(', ')}"`,
      `"${p.resultsSummary.replace(/"/g, '""')}"`,
      `"${p.innovationPoint.replace(/"/g, '""')}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tgrs_infrared_analysis.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBatchAnalyze = () => {
    // Analyze first 5 idle papers to avoid rate limits
    const idlePapers = papers.filter(p => p.status === 'idle').slice(0, 5);
    idlePapers.forEach(p => onAnalyze(p.id));
  };

  return (
    <div className="space-y-6">
      {/* Crawler Config Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600" />
          Crawler Configuration
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Target DBLP Search URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm font-mono text-slate-600"
              placeholder="https://dblp.org/search?q=..."
            />
          </div>
          <div className="flex gap-4">
            <div className="w-24">
              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Start
              </label>
              <input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
              />
            </div>
            <div className="w-24">
              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> End
              </label>
              <input
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isSearching}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            {isSearching ? <RefreshCw className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
            Crawl & Filter
          </button>
        </form>
        <p className="text-xs text-slate-400 mt-2">
          Enter a DBLP search URL (e.g. filtered by stream:journals/tgrs) and the crawler will fetch and filter results by year automatically.
        </p>
      </div>

      {/* Analytics Section (Only shows if we have analyzed data) */}
      {analyzedCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
               <Layers className="w-4 h-4" /> Architecture Distribution
             </h3>
             <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={archData}
                     cx="50%"
                     cy="50%"
                     innerRadius={40}
                     outerRadius={60}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {archData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip />
                   <Legend verticalAlign="middle" align="right" layout="vertical" />
                 </PieChart>
               </ResponsiveContainer>
             </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Processing Status
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Analyzed Papers</span>
                <span className="font-bold text-slate-900">{analyzedCount} / {papers.length}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${(analyzedCount / Math.max(papers.length, 1)) * 100}%` }}
                ></div>
              </div>
              <div className="pt-2">
                 <button 
                  onClick={handleBatchAnalyze}
                  disabled={papers.every(p => p.status !== 'idle')}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  Analyze next batch (5)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Crawl Results ({papers.length})</h2>
          <div className="flex gap-2">
            <button 
              onClick={exportToCSV}
              disabled={papers.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>
        
        {papers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <p className="text-slate-500">No papers found. Enter a valid DBLP URL above to start.</p>
          </div>
        ) : (
          <ExtractionTable papers={papers} onAnalyze={onAnalyze} />
        )}
      </div>
    </div>
  );
};
