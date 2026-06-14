import { JobAbstractFactory } from './job-factory.abstract';
import { FreelanceJobEntity } from '../entities/freelance-job.entity';

export class FreelanceJobFactory extends JobAbstractFactory {

  public create(props: any): FreelanceJobEntity {
    JobAbstractFactory.validate(props);
    const cleanProps = JobAbstractFactory.normalizeNewProps(props);
    return new FreelanceJobEntity(cleanProps);
  }

  public restore(props: any): FreelanceJobEntity {
    return new FreelanceJobEntity(props);
  }
}