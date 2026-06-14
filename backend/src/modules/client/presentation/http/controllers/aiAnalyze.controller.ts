import { Request, Response } from 'express';
import { AnalysisUseCase } from '../../../application/use-cases/analyze/analyze.use-case';
import { CandidateRepository } from '../../../infrastructure/database/repositories/candidate.repository';
import { JobRepository } from '../../../infrastructure/database/repositories/job.repository';
import { AiAnalysisRepository } from '../../../infrastructure/database/repositories/aiAnalyze.repository';
import { GeminiService } from '../../../infrastructure/external-service/gemini.service';
import { AnalysisInputDto } from '../../../application/dtos/analysis/analysis.dto';
import { asyncHandler } from '../../../../../shared/utils/asyncHandler';

const candidateRepository = new CandidateRepository();
const jobRepository = new JobRepository();
const aiAnalyzeRepository = new AiAnalysisRepository();
const geminiService = new GeminiService();

export const analyzeCandidate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const input = req.body as AnalysisInputDto;

  const analyzeUseCase = new AnalysisUseCase(
    candidateRepository,
    jobRepository,
    aiAnalyzeRepository,
    geminiService,
  );
  const result = await analyzeUseCase.execute(input);

  res.status(200).json({
    success: true,
    aiAnalyze: result,
    message: 'Phân tích AI thành công!'
  });
});
