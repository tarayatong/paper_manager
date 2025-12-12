export enum ArchitectureType {
  CNN = 'CNN',
  TRANSFORMER = 'Transformer',
  HYBRID = 'Hybrid',
  UNKNOWN = 'Unknown',
  OTHER = 'Other'
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: string;
  url?: string;
  
  // Extracted Attributes
  isAnalyzed: boolean;
  architecture: ArchitectureType;
  datasets: string[];
  dataSplit: string;
  annotationType: string;
  metrics: string[];
  resultsSummary: string;
  innovationPoint: string;
  
  // Status
  status: 'idle' | 'analyzing' | 'done' | 'error';
}

export interface SearchResult {
  title: string;
  authors: string[];
  year: string;
  link?: string;
}
