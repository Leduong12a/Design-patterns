export interface ICVExtractorAgent {
  execute(fileBuffer: Buffer, mimeType: string): Promise<Record<string, any> | null>;
}

export interface ICandidateAnalyzerAgent {
  execute(candidateData: any, jobData: any): Promise<Record<string, any> | null>;
}

export interface IInterviewEmailAgent {
  execute(input: Record<string, any>): Promise<{ subject: string; html: string } | null>;
}
