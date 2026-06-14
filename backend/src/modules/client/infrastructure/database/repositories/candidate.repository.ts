import mongoose from 'mongoose';
import { CandidateEntity } from '../../../domain/candidate/candidate.entity';
import { NewCandidateCreator, RestoredCandidateCreator } from '../../../domain/candidate/candidate.creator';
import type { ICandidateRepository, IStatus, ICanidateWithScore } from '../../../application/ports/repositories/candidate.interface';
import { CandidateMongoService } from '../services/candidate.mongo.service';

// Adapter — implements ICandidateRepository (Client Interface), wraps CandidateMongoService (Service)
// Chuyển đổi raw Mongoose document → CandidateEntity bằng cách dùng Creator
// Singleton — đảm bảo chỉ tồn tại một instance duy nhất trong candidate module
export class CandidateRepository implements ICandidateRepository {

  private static instance: CandidateRepository;

  static getInstance(): CandidateRepository {
    if (!CandidateRepository.instance) {
      CandidateRepository.instance = new CandidateRepository();
    }
    return CandidateRepository.instance;
  }
  // Adapter: adaptee (Service)
  private readonly service: CandidateMongoService;

  // Factory Method: creators dùng để tạo entity từ raw data
  private readonly restoredCreator: RestoredCandidateCreator;
  private readonly newCreator: NewCandidateCreator;

  constructor() {
    this.service = new CandidateMongoService();
    this.restoredCreator = new RestoredCandidateCreator();
    this.newCreator = new NewCandidateCreator();
  }

  // Singleton: trả về instance duy nhất
  

  async getById(id: string): Promise<CandidateEntity | null> {
    const doc = await this.service.findById(id);
    return this.toEntity(doc);
  }

  private toEntity(doc: any): CandidateEntity | null {
    if (!doc) return null;
    return this.restoredCreator.createCandidate({
      id: doc._id.toString(),
      jobID: doc.jobID?._id?.toString() ?? doc.jobID?.toString(),
      jobTitle: doc.jobID?.title ?? '',
      addedBy: doc.addedBy?.toString(),
      status: doc.status,
      verificationStatus: doc.verificationStatus,
      objective: doc.objective,
      fullTextContent: doc.fullTextContent,
      personal: doc.personal,
      educations: doc.educations,
      experiences: doc.experiences,
      projects: doc.projects,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }) as CandidateEntity;
  }


  async getCandidates(userID: string): Promise<CandidateEntity[]> {
    const docs = await this.service.findAll(userID);
    return docs.map((doc) => this.toEntity(doc)).filter((e): e is CandidateEntity => e !== null);
  }

  async findByEmail(email: string): Promise<CandidateEntity | null> {
    const doc = await this.service.findByEmail(email);
    return this.toEntity(doc);
  }

  async checkExistsCandidate(email: string): Promise<boolean> {
    return this.service.existsByEmail(email);
  }

  async create(candidate: CandidateEntity): Promise<CandidateEntity | null> {
    const { id, ...data } = candidate.getDetailProfile();
    const saved = await this.service.insertOne(data as Record<string, unknown>);
    return this.toEntity(saved);
  }

  async updateStatus(candidateID: string, updateData: IStatus): Promise<void> {
    const updateFields: Record<string, unknown> = {};
    if (updateData.status) updateFields.status = updateData.status;
    if (updateData.verificationStatus) updateFields.verificationStatus = updateData.verificationStatus;
    if (Object.keys(updateFields).length === 0) throw new Error('Không có trường nào để cập nhật');
    await this.service.patchStatus(candidateID, updateFields);
  }

  async update(candidate: CandidateEntity): Promise<CandidateEntity | null> {
    const { id, ...data } = candidate.getDetailProfile();
    const updated = await this.service.replaceOne(id as string, data as Record<string, unknown>);
    return this.toEntity(updated);
  }

  async getCanidateByJob(jobID: string): Promise<ICanidateWithScore[]> {
    const docs = await this.service.aggregateByJob(jobID);
    return docs
      .filter((c: any) => c !== null)
      .map((c: any) => ({
        id: c._id,
        personal: c.personal,
        matchingScore: c.matchingScore ?? null,
      }));
  }

  async countForStatistics(userId: string, startDate?: Date, endDate?: Date, status?: string): Promise<number> {
    const filter = this.buildStatisticsFilter(userId, startDate, endDate, status);
    return this.service.countDocuments(filter);
  }

  async getForStatistics(userId: string, startDate?: Date, endDate?: Date, status?: string): Promise<{ createdAt?: Date; updatedAt?: Date }[]> {
    const filter = this.buildStatisticsFilter(userId, startDate, endDate, status);
    const selectField = status === 'offer' ? 'updatedAt' : 'createdAt';
    const docs = await this.service.findForStatistics(filter, selectField);
    return docs as { createdAt?: Date; updatedAt?: Date }[];
  }

  private buildStatisticsFilter(userId: string, startDate?: Date, endDate?: Date, status?: string) {
    const objectId = new mongoose.Types.ObjectId(userId);
    const filter: Record<string, unknown> = { addedBy: objectId };
    if (status) filter.status = status;
    if (startDate && endDate) {
      const dateField = status === 'offer' ? 'updatedAt' : 'createdAt';
      filter[dateField] = { $gte: startDate, $lt: endDate };
    }
    return filter;
  }
}
