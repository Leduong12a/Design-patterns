import { Request, Response } from 'express';
import { UploadCVUseCase } from '../../../application/use-cases/upload/upload-cv.use-case';
import { CandidateRepository } from '../../../infrastructure/database/repositories/candidate.repository';
import { JobRepository } from '../../../infrastructure/database/repositories/job.repository';
import { UploadService } from '../../../infrastructure/external-service/upload.service';
import { CVExtractorGeminiService } from '../../../infrastructure/external-service/gemini.service';
import { asyncHandler } from '../../../../../shared/utils/asyncHandler';
import { BadRequestError } from '../../../../../shared/utils/errors';

const candidateRepository = new CandidateRepository();
const jobRepository = new JobRepository();
const uploadService = new UploadService();
const cvExtractorService = new CVExtractorGeminiService();
const uploadCVUseCase = new UploadCVUseCase(candidateRepository, jobRepository, uploadService, cvExtractorService);

export const uploadCV = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userID = res.locals.user.id;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const cvFile = files?.cv?.[0];
  const avatarFile = files?.avatar?.[0];
  const { jobID } = req.body as { jobID: string };

  if (!cvFile) {
    throw new BadRequestError('Vui lòng tải lên file CV');
  }

  const { candidate } = await uploadCVUseCase.execute(
    userID,
    jobID,
    cvFile,
    avatarFile,
  );

  res.status(200).json({ message: 'CV processed successfully', candidate });
});
