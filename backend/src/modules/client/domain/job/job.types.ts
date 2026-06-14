export enum JobType {
  FULLTIME = 'FULLTIME',
  FREELANCE = 'FREELANCE'
}

export interface IJobSummary {
  id?: string;
  title: string;
  status: boolean;
  requirements: string[];
  type: JobType;
  createdAt?: Date;
}

export interface IJobDetail extends IJobSummary {
  description: string;
  requirements: string[];
  userID: string;
  deleted: boolean;
  hourlyRate?: number;
  projectDuration?: string;
  probationMonths?: number;
  hasInsurance?: boolean;
}

export interface IJobProps {
  id?: string;
  title: string;
  userID: string;
  description: string;
  requirements: string[];
  status: boolean;
  deleted: boolean;
  type: JobType;
  hourlyRate?: number;
  projectDuration?: string;
  probationMonths?: number;
  hasInsurance?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
