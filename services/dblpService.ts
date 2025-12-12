import { Paper, ArchitectureType } from "../types";

const DBLP_API_BASE = "https://dblp.org/search/publ/api";

export const fetchPapersFromDBLP = async (
  dblpUrl: string, 
  startYear: number, 
  endYear: number
): Promise<Paper[]> => {
  try {
    // 1. Extract the query ('q') parameter from the user's DBLP URL
    const urlObj = new URL(dblpUrl);
    const queryParam = urlObj.searchParams.get("q");

    if (!queryParam) {
      throw new Error("Invalid DBLP URL: Could not find search query parameter 'q'.");
    }

    // 2. Construct the API URL
    // h=1000 fetches up to 1000 results to ensure we cover the years
    const apiUrl = `${DBLP_API_BASE}?q=${encodeURIComponent(queryParam)}&format=json&h=1000`;

    // 3. Fetch data
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`DBLP API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const hits = data.result?.hits?.hit;

    if (!hits || !Array.isArray(hits)) {
      return [];
    }

    // 4. Process and filter results
    const papers: Paper[] = hits
      .map((hit: any) => {
        const info = hit.info;
        const year = parseInt(info.year, 10);
        
        // Handle authors (can be a single object or array)
        let authors: string[] = [];
        if (info.authors?.author) {
            if (Array.isArray(info.authors.author)) {
                authors = info.authors.author.map((a: any) => a.text);
            } else {
                authors = [info.authors.author.text];
            }
        }

        return {
          id: hit["@id"] || crypto.randomUUID(),
          title: info.title,
          authors: authors,
          year: info.year, // Keep as string for display consistency
          url: info.url,
          yearInt: year, // Internal helper
          
          // Defaults
          isAnalyzed: false,
          status: 'idle' as const,
          architecture: ArchitectureType.UNKNOWN,
          datasets: [],
          dataSplit: "Not extracted",
          annotationType: "Not extracted",
          metrics: [],
          resultsSummary: "Not extracted",
          innovationPoint: "Not extracted"
        };
      })
      .filter((p: any) => p.yearInt >= startYear && p.yearInt <= endYear) // Filter by Year Range
      .map((p: any) => {
        const { yearInt, ...rest } = p;
        return rest as Paper;
      });

    return papers;

  } catch (error) {
    console.error("DBLP Fetch Error:", error);
    throw error;
  }
};