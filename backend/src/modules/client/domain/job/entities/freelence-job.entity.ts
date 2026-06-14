import { JobEntity } from './job.entity';
import { JobType } from '../job.types';
import type { IJobProps } from '../job.types';

export class FreelanceJobEntity extends JobEntity {
  protected hourlyRate: number;
  protected projectDuration: string;

  constructor(props: Omit<IJobProps, 'type'> & { type?: JobType; hourlyRate?: number; projectDuration?: string }) {
    super({ ...props, type: JobType.FREELANCE });
    this.hourlyRate = props.hourlyRate ?? 0;
    this.projectDuration = props.projectDuration ?? '';
  }

  public closeJob(): void {
    if (this.status === true) throw new Error('Domain Error: Freelance Job đã kết thúc.');
    this.status = true;
    this.updatedAt = new Date();
  }

  public override update(title: string, description: string, requirements: string[], extra?: any): void {
    super.update(title, description, requirements, extra);
    if (extra) {
      if (extra.hourlyRate !== undefined) this.hourlyRate = extra.hourlyRate;
      if (extra.projectDuration !== undefined) this.projectDuration = extra.projectDuration;
    }
  }

  public getDetailJob(): any {
    return {
      ...this.getSummary(),
      userID: this.userID,
      description: this.description,
      hourlyRate: this.hourlyRate,
      projectDuration: this.projectDuration,
      deleted: this.deleted,
    };
  }
}