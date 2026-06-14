import { Request, Response } from 'express';
import { CreateJobUseCase } from '../../../application/use-cases/job/create.use-case';
import { UpdateJobUseCase } from '../../../application/use-cases/job/update.use-case';
import { GetAllJobUseCase } from '../../../application/use-cases/job/get-all.use-case';
import { DeleteJobUseCase } from '../../../application/use-cases/job/delete.use-case';
import { GetJobByIdUseCase } from '../../../application/use-cases/job/get-by-id.use-case';
import { GetCanidateByJobUseCase } from '../../../application/use-cases/candidate/get-candidate-by-job.use-case';
import { ICreateJobInputDto, IUpdateJobInputDto } from '../../../application/dtos/job/create.dto';
import { JobRepository } from '../../../infrastructure/database/repositories/job.repository';
import { CandidateRepository } from '../../../infrastructure/database/repositories/candidate.repository';
import { asyncHandler } from '../../../../../shared/utils/asyncHandler';
import { NotFoundError, BadRequestError } from '../../../../../shared/utils/errors';

const jobRepository = new JobRepository();
const candidateRepo = new CandidateRepository();
const createJobUseCase = new CreateJobUseCase(jobRepository);
const updateJobUseCase = new UpdateJobUseCase(jobRepository);
const getAllJobUseCase = new GetAllJobUseCase(jobRepository);
const deleteJobUseCase = new DeleteJobUseCase(jobRepository);
const getJobByIdUseCase = new GetJobByIdUseCase(jobRepository);
const getCandidateByJobUseCase = new GetCanidateByJobUseCase(candidateRepo);

export const createJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userID = res.locals.user.id;

  const newJob = await createJobUseCase.execute(userID, req.body as ICreateJobInputDto);

  res.status(201).json({ success: true, message: 'Tạo công việc thành công!', newJob: newJob });
});

export const updateJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userID = res.locals.user.id;
  const jobId = req.params['id'] as string;
  const updateData = req.body as IUpdateJobInputDto;

  const updatedJob = await updateJobUseCase.execute(jobId, userID, updateData);

  res.status(200).json({
    success: true,
    message: 'Cập nhật công việc thành công!',
    updatedJob: updatedJob
  });
});

export const getAllJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userID = res.locals.user.id;

  const jobs = await getAllJobUseCase.execute(userID);

  res.status(200).json({ success: true, message: 'Thành công', jobs: jobs });
});

export const getCandidateByJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const jobID = req.params.id?.toString() || "";

  if (!jobID) {
    throw new BadRequestError('ID công việc không hợp lệ!');
  }

  const candidates = await getCandidateByJobUseCase.execute(jobID);

  res.status(200).json({
    success: true,
    candidates: candidates
  });
});

export const getJobById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const jobId = req.params['id'] as string;

  const job = await getJobByIdUseCase.execute(jobId);

  if (!job) {
    throw new NotFoundError('Không tìm thấy công việc!');
  }

  res.status(200).json({ success: true, message: 'Thành công', job: job });
});

export const deleteJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userID = res.locals.user.id;
  const jobId = req.params['id'] as string;

  await deleteJobUseCase.execute(jobId, userID);

  res.status(200).json({ success: true, message: 'Xóa công việc thành công!' });
});
