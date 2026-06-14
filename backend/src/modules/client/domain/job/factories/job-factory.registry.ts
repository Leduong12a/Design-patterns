import { JobType } from '../job.types';
import { FreelanceJobFactory } from './freelance-job.factory';
import { FullTimeJobFactory } from './fulltime-job.factory';
import type { JobEntity } from '../entities/job.entity';

export class JobFactoryRegistry {
  private static factories = {
    [JobType.FREELANCE]: new FreelanceJobFactory(),
    [JobType.FULLTIME]: new FullTimeJobFactory()
  };

  public static create(type: JobType, props: any): JobEntity {
    const factory = this.factories[type];
    if (!factory) {
      throw new Error(`Domain Error: Loại công việc không hợp lệ: ${type}`);
    }
    return factory.create(props);
  }

  public static restore(type: JobType, props: any): JobEntity {
    const factory = this.factories[type];
    if (!factory) {
      throw new Error(`Domain Error: Loại công việc không hợp lệ: ${type}`);
    }
    return factory.restore(props);
  }
}
