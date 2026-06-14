import type { ICandidateDetailProfile } from '../../../domain/candidate';
import type { ICandidateRepository } from '../../../application/ports/repositories/candidate.interface';

export class GetCandidateDetailUseCase {
  constructor(private readonly candidateRepo: ICandidateRepository) { }

  async execute(candidateID: string): Promise<ICandidateDetailProfile | null> {
    const candidate = await this.candidateRepo.getById(candidateID);

    if (!candidate) {
      throw new Error("Ứng viên không tồn tại");
    }

    return candidate.getDetailProfile();
  }
}
