import { JobType } from '../job.types';
import type { JobAbstractFactory } from './job-factory.abstract';
import type { JobEntity } from '../entities/job.entity';

export class JobFactoryRegistry {
  private static factories = new Map<JobType, JobAbstractFactory>();

  public static register(type: JobType, factory: JobAbstractFactory): void {
    this.factories.set(type, factory);
  }

  public static create(type: JobType, props: any): JobEntity {
    const factory = this.factories.get(type);
    if (!factory) {
      throw new Error(`Domain Error: Chưa đăng ký Factory cho loại công việc ${type}`);
    }
    return factory.create(props);
  }

  public static restore(type: JobType, props: any): JobEntity {
    const factory = this.factories.get(type);
    if (!factory) {
      throw new Error(`Domain Error: Chưa đăng ký Factory cho loại công việc ${type}`);
    }
    return factory.restore(props);
  }
}
