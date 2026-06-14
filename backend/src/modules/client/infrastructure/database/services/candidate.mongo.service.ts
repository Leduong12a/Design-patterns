import mongoose from 'mongoose';
import Candidate from '../models/candidate.model';

// Service — lớp DB thô, trả về raw Mongoose document
// Đây là "Service" trong Adapter Pattern: interface không tương thích với domain
export class CandidateMongoService {
  async findById(id: string) {
    const objectId = new mongoose.Types.ObjectId(id);
    return Candidate.findOne({ _id: objectId }).lean();
  }

  async findAll(userID: string) {
    const objectId = new mongoose.Types.ObjectId(userID);
    const selectedFields = 'jobID status isVerify createdAt personal.fullName personal.email personal.phone personal.cvLink experiences projects';
    return Candidate.find({ addedBy: objectId })
      .select(selectedFields)
      .populate('jobID', 'title')
      .lean();
  }

  async findByEmail(email: string) {
    return Candidate.findOne({ 'personal.email': email }).lean();
  }

  async existsByEmail(email: string) {
    const result = await Candidate.exists({ 'personal.email': email });
    return result !== null;
  }

  async insertOne(data: Record<string, unknown>) {
    const newCandidate = new Candidate(data);
    return newCandidate.save();
  }

  async patchStatus(candidateID: string, updateFields: Record<string, unknown>) {
    const result = await Candidate.updateOne({ _id: candidateID }, updateFields);
    if (result.modifiedCount === 0) {
      throw new Error('Không thể cập nhật trạng thái ứng viên');
    }
  }

  async replaceOne(id: string, data: Record<string, unknown>) {
    return Candidate.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  }

  async aggregateByJob(jobID: string) {
    return Candidate.aggregate([
      { $match: { jobID: new mongoose.Types.ObjectId(jobID) } },
      {
        $lookup: {
          from: 'aianalyses',
          localField: '_id',
          foreignField: 'candidateID',
          as: 'aiAnalyze',
        },
      },
      { $unwind: { path: '$aiAnalyze', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, personal: 1, matchingScore: '$aiAnalyze.matchingScore' } },
      { $sort: { matchingScore: -1 } },
    ]);
  }

  async countDocuments(filter: Record<string, unknown>) {
    return Candidate.countDocuments(filter);
  }

  async findForStatistics(filter: Record<string, unknown>, selectField: string) {
    return Candidate.find(filter).select(selectField).lean();
  }
}
