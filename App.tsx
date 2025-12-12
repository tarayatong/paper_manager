import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Paper } from './types';
import { analyzePaper } from './services/geminiService';
import { fetchPapersFromDBLP } from './services/dblpService';
import { Microscope, BookOpen } from 'lucide-react';

const App: React.FC = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (url: string, startYear: number, endYear: number) => {
    setIsSearching(true);
    try {
      // Use the Crawler Service
      const results = await fetchPapersFromDBLP(url, startYear, endYear);
      setPapers(results);
    } catch (error) {
      alert("Failed to crawl papers. Please check the URL and try again. Note: The URL must be a valid dblp search URL.");
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAnalyze = async (id: string) => {
    // Optimistic update
    setPapers(prev => prev.map(p => p.id === id ? { ...p, status: 'analyzing' } : p));

    try {
      const paperToAnalyze = papers.find(p => p.id === id);
      if (!paperToAnalyze) return;

      const analyzedPaper = await analyzePaper(paperToAnalyze);
      
      setPapers(prev => prev.map(p => 
        p.id === id ? (analyzedPaper as Paper) : p
      ));
    } catch (error) {
      setPapers(prev => prev.map(p => p.id === id ? { ...p, status: 'error' } : p));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Microscope size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              TGRS <span className="text-indigo-600">Infrared Insight</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
             <div className="flex items-center gap-1">
               <BookOpen size={16} />
               <span>Research Crawler Assistant</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard 
          papers={papers}
          onAnalyze={handleAnalyze}
          onSearch={handleSearch}
          isSearching={isSearching}
        />
      </main>
    </div>
  );
};

export default App;
