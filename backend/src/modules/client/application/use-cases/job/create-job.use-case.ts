import type { IJobWriteRepo } from '../../../application/ports/repositories/job.interface';
import { JobFactoryRegistry } from '../../../domain/job';
import { ICreateJobInputDto } from '../../dtos/job/create.dto';
import { IJobOutputDto } from '../../dtos/job/get.dto';

export class CreateJobUseCase {
  constructor(private readonly jobRepo: IJobWriteRepo) { }

  async execute(userID: string, jobData: ICreateJobInputDto): Promise<IJobOutputDto | null> {

    if (!userID || !jobData.title) {
      throw new Error("UserID và Tiêu đề là bắt buộc!");
    }

    const job = JobFactoryRegistry.create(jobData.type, {
      userID: userID,
      title: jobData.title,
      description: jobData.description ?? '',
      requirements: jobData.requirements ?? [],
      hourlyRate: jobData.hourlyRate,
      projectDuration: jobData.projectDuration,
      probationMonths: jobData.probationMonths,
      hasInsurance: jobData.hasInsurance
    });

    const savedJob = await this.jobRepo.create(job);

    if (!savedJob) throw new Error("Tạo mới không thành công!")

    return savedJob.getDetailJob();
  }
}
