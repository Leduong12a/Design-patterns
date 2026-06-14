import { JobType } from '../../../domain/job/job.types';

export interface ICreateJobInputDto {
  title: string;
  description?: string;
  requirements?: string[];
  type: JobType;
  
  hourlyRate?: number;
  projectDuration?: string;
  
  probationMonths?: number;
  hasInsurance?: boolean;
}

export interface IUpdateJobInputDto {
  title?: string;
  description?: string;
  requirements?: string[];
  status?: boolean;
  
  hourlyRate?: number;
  projectDuration?: string;
  
  probationMonths?: number;
  hasInsurance?: boolean;
}
