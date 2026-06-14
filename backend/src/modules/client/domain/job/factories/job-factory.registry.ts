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
    const factory = this.factories[type] || this.factories[JobType.FULLTIME];
    return factory.create(props);
  }

  public static restore(type: JobType, props: any): JobEntity {
    const factory = this.factories[type] || this.factories[JobType.FULLTIME];
    return factory.restore(props);
  }
}
