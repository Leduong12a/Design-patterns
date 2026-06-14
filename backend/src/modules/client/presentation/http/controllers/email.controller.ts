import { Request, Response } from 'express';
import { SendBulkEmailUseCase } from '../../../application/use-cases/email/send-bulk-email.use-case';
import { CandidateRepository } from '../../../infrastructure/database/repositories/candidate.repository';
import { JobRepository } from '../../../infrastructure/database/repositories/job.repository';
import { MailService } from '../../../infrastructure/external-service/mail.service';
import { asyncHandler } from '../../../../../shared/utils/asyncHandler';

const candidateRepository = new CandidateRepository();
const jobRepository = new JobRepository();
const mailService = new MailService();

export const sendBulkEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { candidateIds, template, title, content } = req.body as {
    candidateIds: string[];
    template: { id: number; name: string };
    title: string;
    content: string;
  };

  const sendBulkEmailUseCase = new SendBulkEmailUseCase(
    candidateRepository,
    jobRepository,
    mailService,
  );

  const result = await sendBulkEmailUseCase.execute({
    candidateIds,
    template,
    title,
    content,
  });

  res.status(200).json({
    success: true,
    message: result.message,
    totalSent: result.totalSent,
    totalCandidates: candidateIds.length,
    failed: result.failed,
  });
});
