import { Request, Response } from 'express';
import { GetStatisticsUseCase } from '../../../application/use-cases/report/get-statistics.use-case';
import { CandidateRepository } from '../../../infrastructure/database/repositories/candidate.repository';
import { InterviewScheduleRepository } from '../../../infrastructure/database/repositories/interviewSchedule.repository';
import { asyncHandler } from '../../../../../shared/utils/asyncHandler';
import { UnauthorizedError } from '../../../../../shared/utils/errors';

const candidateRepo = new CandidateRepository();
const interviewRepo = new InterviewScheduleRepository();
const getStatisticsUseCase = new GetStatisticsUseCase(candidateRepo, interviewRepo);

// [GET] /report/statistics
export const getStatistics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = res.locals.user?.id || res.locals.user?._id; 
  const { filterCriteria, filterDate } = req.query;

  if (!userId) {
    throw new UnauthorizedError('Unauthorized, user ID not found');
  }

  const reportData = await getStatisticsUseCase.execute(
    userId.toString(),
    filterCriteria as string,
    filterDate as string
  );

  res.status(200).json({
    success: true,
    data: reportData,
  });
});

