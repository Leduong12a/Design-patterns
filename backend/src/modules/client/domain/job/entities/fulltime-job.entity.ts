import { JobEntity } from './job.entity';
import { JobType } from '../job.types';
import type { IJobProps } from '../job.types';

export class FullTimeJobEntity extends JobEntity {
  protected probationMonths: number;
  protected hasInsurance: boolean;

  constructor(props: Omit<IJobProps, 'type'> & { type?: JobType; probationMonths?: number; hasInsurance?: boolean }) {
    super({ ...props, type: JobType.FULLTIME });
    this.probationMonths = props.probationMonths ?? 2;
    this.hasInsurance = props.hasInsurance ?? true;
  }

  public closeJob(): void {
    if (this.status === true) throw new Error('Domain Error: Công việc Full-time này đã được đóng từ trước.');
    this.status = true;
    this.updatedAt = new Date();
  }

  public override update(title: string, description: string, requirements: string[], extra?: any): void {
    super.update(title, description, requirements, extra);
    if (extra) {
      if (extra.probationMonths !== undefined) this.probationMonths = extra.probationMonths;
      if (extra.hasInsurance !== undefined) this.hasInsurance = extra.hasInsurance;
    }
  }

  public getDetailJob(): any {
    return {
      ...this.getSummary(),
      userID: this.userID,
      description: this.description,
      probationMonths: this.probationMonths,
      hasInsurance: this.hasInsurance,
      deleted: this.deleted,
    };
  }
}