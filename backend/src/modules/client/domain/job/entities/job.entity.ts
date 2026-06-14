import type { IJobDetail, IJobProps, IJobSummary } from '../job.types';
import { JobType } from '../job.types';

export abstract class JobEntity {
  protected id?: string;
  protected userID: string;
  protected title: string;
  protected description: string;
  protected requirements: string[];
  protected status: boolean;
  protected deleted: boolean;
  protected type: JobType;
  protected createdAt?: Date;
  protected updatedAt?: Date;

  constructor(props: IJobProps) {
    this.id = props.id ? props.id.toString() : undefined;
    this.userID = props.userID ? props.userID.toString() : '';
    this.title = props.title ? props.title.trim() : '';
    this.description = props.description ? props.description.trim() : '';
    this.requirements = Array.isArray(props.requirements) ? props.requirements : [];
    this.status = props.status ?? false;
    this.deleted = props.deleted ?? false;
    this.type = props.type;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public getId(): string | undefined {
    return this.id;
  }

  public getTitle(): string {
    return this.title;
  }

  public getDescription(): string {
    return this.description;
  }

  public getRequirements(): string[] {
    return this.requirements;
  }

  public getUserID(): string {
    return this.userID;
  }

  public getType(): JobType {
    return this.type;
  }

  public isOwner(currentUserID: string): boolean {
    return currentUserID === this.userID;
  }

  public delete(status: boolean): void {
    this.deleted = status;
    this.updatedAt = new Date();
  }

  public isActive(): boolean {
    return this.status === false;
  }

  public update(title: string, description: string, requirements: string[], extra?: any): void {
    this.title = title ? title.trim() : '';
    this.description = description ? description.trim() : '';
    this.requirements = Array.isArray(requirements) ? requirements : [];
    this.updatedAt = new Date();
  }

  public abstract closeJob(): void;

  public getSummary(): IJobSummary {
    return {
      id: this.id,
      title: this.title,
      status: this.status,
      requirements: this.requirements,
      type: this.type,
      createdAt: this.createdAt
    };
  }

  public abstract getDetailJob(): IJobDetail;
}