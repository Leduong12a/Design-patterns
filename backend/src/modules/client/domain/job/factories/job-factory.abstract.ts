import type { JobEntity } from '../entities/job.entity';
import type { IJobProps } from '../job.types';

export abstract class JobAbstractFactory {
  protected static validate(props: IJobProps): void {
    if (!props.userID) throw new Error('Domain Error: Job phải có UserID.');
    if (!props.title?.trim()) throw new Error('Domain Error: Thiếu tiêu đề công việc.');
  }

  protected static normalizeNewProps(props: any): IJobProps {
    return {
      ...props,
      status: false,
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  public abstract create(props: any): JobEntity;
  public abstract restore(props: any): JobEntity;
}