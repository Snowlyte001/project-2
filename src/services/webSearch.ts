interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
}

interface SerperResponse {
  organic: SearchResult[];
  answerBox?: {
    answer: string;
    title: string;
    link: string;
  };
  knowledgeGraph?: {
    title: string;
    description: string;
  };
}

export class WebSearchService {
  private static readonly SERPER_API_URL = 'https://google.serper.dev/search';
  private static readonly API_KEY = import.meta.env.VITE_SERPER_API_KEY;

  static async searchParentingInfo(query: string): Promise<{
    results: SearchResult[];
    summary?: string;
    hasResults: boolean;
  }> {
    if (!this.API_KEY) {
      console.log('Serper API key not found, using offline mode');
      return { results: [], hasResults: false };
    }

    try {
      // Enhance query for better parenting-specific results
      const enhancedQuery = this.enhanceParentingQuery(query);
      
      const response = await fetch(this.SERPER_API_URL, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: enhancedQuery,
          num: 8,
          hl: 'en',
          gl: 'us',
          safe: 'active', // Safe search for family content
        }),
      });

      if (!response.ok) {
        throw new Error(`Serper API error: ${response.status}`);
      }

      const data: SerperResponse = await response.json();
      
      // Filter and process results for parenting relevance
      const relevantResults = this.filterParentingResults(data.organic || []);
      
      return {
        results: relevantResults,
        summary: data.answerBox?.answer || data.knowledgeGraph?.description,
        hasResults: relevantResults.length > 0
      };

    } catch (error) {
      console.error('Web search failed:', error);
      return { results: [], hasResults: false };
    }
  }

  private static enhanceParentingQuery(query: string): string {
    const parentingKeywords = [
      'parenting', 'child development', 'pediatric', 'family', 'children',
      'toddler', 'baby', 'infant', 'preschooler', 'kids'
    ];
    
    const lowerQuery = query.toLowerCase();
    const hasParentingContext = parentingKeywords.some(keyword => 
      lowerQuery.includes(keyword)
    );

    if (!hasParentingContext) {
      // Add parenting context to generic queries
      return `${query} parenting children family pediatric advice`;
    }

    // Add current year and authoritative sources for better results
    return `${query} 2024 2025 pediatric guidelines expert advice`;
  }

  private static filterParentingResults(results: SearchResult[]): SearchResult[] {
    const trustedDomains = [
      'aap.org', 'healthychildren.org', 'cdc.gov', 'mayoclinic.org',
      'webmd.com', 'babycenter.com', 'whattoexpect.com', 'parents.com',
      'verywellfamily.com', 'kidshealth.org', 'zerotothree.org',
      'childmind.org', 'nih.gov', 'acog.org', 'brightfutures.aap.org'
    ];

    const spamKeywords = [
      'buy', 'sale', 'discount', 'coupon', 'affiliate', 'sponsored',
      'advertisement', 'product review', 'best deals'
    ];

    return results
      .filter(result => {
        // Prioritize trusted medical and parenting sources
        const domain = new URL(result.link).hostname.toLowerCase();
        const isTrustedDomain = trustedDomains.some(trusted => 
          domain.includes(trusted)
        );
        
        // Filter out commercial/spam content
        const hasSpamContent = spamKeywords.some(spam => 
          result.title.toLowerCase().includes(spam) ||
          result.snippet.toLowerCase().includes(spam)
        );

        // Include if trusted domain or if content seems educational
        const isEducational = result.snippet.toLowerCase().includes('development') ||
          result.snippet.toLowerCase().includes('pediatric') ||
          result.snippet.toLowerCase().includes('research') ||
          result.snippet.toLowerCase().includes('study');

        return (isTrustedDomain || isEducational) && !hasSpamContent;
      })
      .slice(0, 5); // Limit to top 5 most relevant results
  }

  static formatSearchResults(results: SearchResult[], summary?: string): string {
    if (results.length === 0) {
      return '';
    }

    let formatted = '';
    
    if (summary) {
      formatted += `**Latest Information:**\n${summary}\n\n`;
    }

    formatted += `**Recent Research & Expert Sources:**\n`;
    results.forEach((result, index) => {
      const domain = new URL(result.link).hostname.replace('www.', '');
      formatted += `${index + 1}. **${result.title}** (${domain})\n`;
      formatted += `   ${result.snippet}\n\n`;
    });

    return formatted;
  }
}