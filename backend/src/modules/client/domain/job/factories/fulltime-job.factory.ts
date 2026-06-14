import { JobAbstractFactory } from './job-factory.astract';
import { FullTimeJobEntity } from '../entities/fulltime-job.entity';

export class FullTimeJobFactory extends JobAbstractFactory {

  public create(props: any): FullTimeJobEntity {
    JobAbstractFactory.validate(props);
    const cleanProps = JobAbstractFactory.normalizeNewProps(props);
    return new FullTimeJobEntity(cleanProps);
  }

  public restore(props: any): FullTimeJobEntity {
    return new FullTimeJobEntity(props);
  }
}