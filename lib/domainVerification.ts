
interface DomainVerificationResult {
  success: boolean;
  method: 'txt_record' | 'html_file' | 'meta_tag';
  error?: string;
}

interface DomainVerificationInstructions {
  txtRecord: {
    name: string;
    value: string;
    instructions: string;
  };
  htmlFile: {
    filename: string;
    content: string;
    path: string;
    instructions: string;
  };
  metaTag: {
    tag: string;
    instructions: string;
  };
}

export class DomainVerificationService {
  
  static generateVerificationInstructions(domain: string, token: string): DomainVerificationInstructions {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    return {
      txtRecord: {
        name: `_blogrolly-verification.${cleanDomain}`,
        value: token,
        instructions: `Add a TXT record to your domain's DNS with name "_blogrolly-verification" and value "${token}"`
      },
      htmlFile: {
        filename: `${token}.html`,
        content: `<!DOCTYPE html><html><head><title>BlogRolly Domain Verification</title></head><body><p>BlogRolly domain verification: ${token}</p></body></html>`,
        path: `https://${cleanDomain}/${token}.html`,
        instructions: `Upload a file named "${token}.html" to your website's root directory`
      },
      metaTag: {
        tag: `<meta name="blogrolly-verification" content="${token}" />`,
        instructions: `Add this meta tag to the <head> section of your website's homepage`
      }
    };
  }

  static async verifyDomain(domain: string, token: string, method: 'txt_record' | 'html_file' | 'meta_tag'): Promise<DomainVerificationResult> {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    try {
      switch (method) {
        case 'txt_record':
          return await this.verifyTxtRecord(cleanDomain, token);
        case 'html_file':
          return await this.verifyHtmlFile(cleanDomain, token);
        case 'meta_tag':
          return await this.verifyMetaTag(cleanDomain, token);
        default:
          return { success: false, method, error: 'Invalid verification method' };
      }
    } catch (error) {
      return { 
        success: false, 
        method, 
        error: error instanceof Error ? error.message : 'Verification failed' 
      };
    }
  }

  private static async verifyTxtRecord(domain: string, token: string): Promise<DomainVerificationResult> {
    try {
      // In a real implementation, you would use a DNS lookup service
      // For now, we'll simulate the verification
      const response = await fetch(`https://dns.google/resolve?name=_blogrolly-verification.${domain}&type=TXT`);
      const data = await response.json();
      
      if (data.Answer) {
        const txtRecords = data.Answer
          .filter((record: any) => record.type === 16)
          .map((record: any) => record.data.replace(/"/g, ''));
        
        const isVerified = txtRecords.some((record: string) => record === token);
        
        return {
          success: isVerified,
          method: 'txt_record',
          error: isVerified ? undefined : 'TXT record not found or incorrect'
        };
      }
      
      return { success: false, method: 'txt_record', error: 'No TXT records found' };
    } catch (error) {
      return { success: false, method: 'txt_record', error: 'DNS lookup failed' };
    }
  }

  private static async verifyHtmlFile(domain: string, token: string): Promise<DomainVerificationResult> {
    try {
      const url = `https://${domain}/${token}.html`;
      const response = await fetch(url, { 
        method: 'GET',
        headers: { 'User-Agent': 'BlogRolly-Verification/1.0' }
      });
      
      if (!response.ok) {
        return { success: false, method: 'html_file', error: `File not accessible (HTTP ${response.status})` };
      }
      
      const content = await response.text();
      const isVerified = content.includes(token);
      
      return {
        success: isVerified,
        method: 'html_file',
        error: isVerified ? undefined : 'Verification token not found in file'
      };
    } catch (error) {
      return { success: false, method: 'html_file', error: 'Could not fetch verification file' };
    }
  }

  private static async verifyMetaTag(domain: string, token: string): Promise<DomainVerificationResult> {
    try {
      const url = `https://${domain}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': 'BlogRolly-Verification/1.0' }
      });
      
      if (!response.ok) {
        return { success: false, method: 'meta_tag', error: `Website not accessible (HTTP ${response.status})` };
      }
      
      const html = await response.text();
      const metaTagRegex = /<meta\s+name=["']blogrolly-verification["']\s+content=["']([^"']+)["']/i;
      const match = html.match(metaTagRegex);
      
      if (match && match[1] === token) {
        return { success: true, method: 'meta_tag' };
      }
      
      return { success: false, method: 'meta_tag', error: 'Meta tag not found or incorrect' };
    } catch (error) {
      return { success: false, method: 'meta_tag', error: 'Could not fetch website homepage' };
    }
  }

  static extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      // If URL parsing fails, try to extract domain manually
      return url.replace(/^https?:\/\//, '').split('/')[0];
    }
  }
}
