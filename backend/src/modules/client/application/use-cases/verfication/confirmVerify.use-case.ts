import type { IVerificationRepository } from '../../../application/ports/repositories/verification.interface';
import type { ICandidateReadRepo, ICandidateWriteRepo } from '../../../application/ports/repositories/candidate.interface';
import { CandidateStatus, VerificationStatus } from '../../../domain/candidate';

export class ConfirmVerifyUseCase {
  constructor(
    private readonly verificationRepo: IVerificationRepository,
    private readonly candidateReadRepo: ICandidateReadRepo,
    private readonly candidateWriteRepo: ICandidateWriteRepo
  ) { }

  async execute(candidateID: string, status: string): Promise<string> {
    if (!status || !['verified', 'risky'].includes(status)) {
      throw new Error('Status không hợp lệ. Chỉ cho phép: verified hoặc risky');
    }

    await this.verificationRepo.updateVerificationStatus(candidateID, status === 'verified');

    const candidate = await this.candidateReadRepo.getById(candidateID);
    if (!candidate) {
      throw new Error('Ứng viên không tìm thấy');
    }

    const message = status === 'risky' ? candidate.markRisky() : candidate.verify();

    await this.candidateWriteRepo.update(candidate);

    return message;
  }
}