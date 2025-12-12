import React from 'react';
import { Paper, ArchitectureType } from '../types';
import { CheckCircle, XCircle, Loader2, Play } from 'lucide-react';

interface Props {
  papers: Paper[];
  onAnalyze: (id: string) => void;
}

export const ExtractionTable: React.FC<Props> = ({ papers, onAnalyze }) => {
  if (papers.length === 0) return null;

  const getArchBadge = (type: ArchitectureType) => {
    switch(type) {
      case ArchitectureType.CNN: return <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold">CNN</span>;
      case ArchitectureType.TRANSFORMER: return <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs font-semibold">Transformer</span>;
      case ArchitectureType.HYBRID: return <span className="px-2 py-1 rounded bg-teal-100 text-teal-800 text-xs font-semibold">Hybrid</span>;
      default: return <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs">Unknown</span>;
    }
  };

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm bg-white">
      <table className="w-full text-sm text-left text-slate-600">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 font-medium w-12">Action</th>
            <th className="px-4 py-3 font-medium w-64">Paper</th>
            <th className="px-4 py-3 font-medium">Architecture</th>
            <th className="px-4 py-3 font-medium">Innovation</th>
            <th className="px-4 py-3 font-medium">Datasets</th>
            <th className="px-4 py-3 font-medium">Metrics & Results</th>
          </tr>
        </thead>
        <tbody>
          {papers.map((paper) => (
            <tr key={paper.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3">
                {paper.status === 'idle' && (
                  <button 
                    onClick={() => onAnalyze(paper.id)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-indigo-600 transition"
                    title="Analyze Paper"
                  >
                    <Play size={16} />
                  </button>
                )}
                {paper.status === 'analyzing' && (
                  <Loader2 size={16} className="animate-spin text-indigo-500" />
                )}
                {paper.status === 'done' && (
                  <CheckCircle size={16} className="text-green-500" />
                )}
                {paper.status === 'error' && (
                  <XCircle size={16} className="text-red-500" />
                )}
              </td>
              <td className="px-4 py-3">
                <div className="font-semibold text-slate-900 line-clamp-2" title={paper.title}>
                  {paper.title}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {paper.authors[0]} et al. ({paper.year})
                </div>
              </td>
              <td className="px-4 py-3">
                {paper.isAnalyzed ? getArchBadge(paper.architecture) : <span className="text-slate-300">-</span>}
              </td>
              <td className="px-4 py-3 max-w-xs">
                 {paper.isAnalyzed ? (
                   <p className="text-xs line-clamp-3" title={paper.innovationPoint}>{paper.innovationPoint}</p>
                 ) : <span className="text-slate-300">-</span>}
              </td>
              <td className="px-4 py-3 max-w-xs">
                {paper.isAnalyzed ? (
                  <div className="flex flex-wrap gap-1">
                    {paper.datasets.map((d, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] border border-slate-200 whitespace-nowrap">
                        {d}
                      </span>
                    ))}
                    <div className="text-[10px] text-slate-400 mt-1">Split: {paper.dataSplit}</div>
                  </div>
                ) : <span className="text-slate-300">-</span>}
              </td>
              <td className="px-4 py-3 max-w-xs">
                {paper.isAnalyzed ? (
                   <div className="space-y-1">
                     <div className="flex flex-wrap gap-1">
                       {paper.metrics.map((m, i) => (
                         <span key={i} className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded">
                           {m}
                         </span>
                       ))}
                     </div>
                     <p className="text-xs text-slate-600 line-clamp-3" title={paper.resultsSummary}>
                       {paper.resultsSummary}
                     </p>
                   </div>
                 ) : <span className="text-slate-300">-</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
