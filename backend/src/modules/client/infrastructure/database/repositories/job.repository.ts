import Job from '../models/job.model';
import { JobEntity } from '../../../domain/job/entities/job.entity';
import { JobFactoryRegistry } from '../../../domain/job/factories/job-factory.registry';
import type { IJobReadRepo, IJobWriteRepo } from '../../../application/ports/repositories/job.interface';
import type { IJobSummary } from '../../../domain/job/job.types';

export class JobRepository implements IJobReadRepo, IJobWriteRepo {
  private mapToEntity(doc: any | null): JobEntity | null {
    if (!doc) return null;
    const d = doc.toObject ? doc.toObject() : doc;

    let jobType = d.type;
    if (jobType !== 'FULLTIME' && jobType !== 'FREELANCE') {
      jobType = 'FULLTIME';
    }

    return JobFactoryRegistry.restore(jobType, {
      id: d._id?.toString() || '',
      title: d.title,
      userID: d.userID?.toString() || '',
      description: d.description,
      requirements: d.requirements,
      status: d.status,
      deleted: d.deleted,
      type: jobType,
      hourlyRate: d.hourlyRate,
      projectDuration: d.projectDuration,
      probationMonths: d.probationMonths,
      hasInsurance: d.hasInsurance,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    });
  }

  public async create(job: JobEntity): Promise<JobEntity | null> {
    const { id, ...data } = job.getDetailJob();
    const newJob = new Job(data);
    const savedJob = await newJob.save();
    return this.mapToEntity(savedJob);
  }

  public async getAll(userID: string): Promise<IJobSummary[]> {
    const data = await Job.find({ userID, deleted: false }).lean();

    return data.map((d: any) => ({
      id: d._id?.toString() || '',
      title: d.title,
      status: d.status,
      requirements: d.requirements,
      type: d.type,
      createdAt: d.createdAt,
    }));
  }

  public async getById(id: string): Promise<JobEntity | null> {
    const job = await Job.findOne({
      _id: id,
      deleted: false
    }
    ).lean();
    return this.mapToEntity(job);
  }

  public async update(job: JobEntity): Promise<JobEntity | null> {
    const { id, ...data } = job.getDetailJob();

    const updatedDoc = await Job.findOneAndUpdate(
      { _id: id, deleted: false },
      data,
      { returnDocument: 'after' }
    ).lean();

    return this.mapToEntity(updatedDoc);
  }
}
