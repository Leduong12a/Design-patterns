import { JobType } from '../../../domain/job';

export interface ICreateJobInputDto {
  title: string;
  description?: string;
  requirements?: string[];
  type: JobType;
  // Freelance fields
  hourlyRate?: number;
  projectDuration?: string;
  // Full-Time fields
  probationMonths?: number;
  hasInsurance?: boolean;
}

export interface IUpdateJobInputDto {
  title?: string;
  description?: string;
  requirements?: string[];
  status?: boolean;
  // Freelance fields
  hourlyRate?: number;
  projectDuration?: string;
  // Full-Time fields
  probationMonths?: number;
  hasInsurance?: boolean;
}

