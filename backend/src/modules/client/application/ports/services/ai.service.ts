export interface ICVExtractorAgent {
  extractCV(fileBuffer: Buffer, mimeType: string): Promise<Record<string, any> | null>;
}

export interface ICandidateAnalyzerAgent {
  analyzeCandidateWithJob(candidateData: any, jobData: any): Promise<Record<string, any> | null>;
}

export interface IInterviewEmailAgent {
  generateInterviewEmail(input: Record<string, any>): Promise<{ subject: string; html: string } | null>;
}
