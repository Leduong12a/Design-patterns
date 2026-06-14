import type { ICandidateRepository, IStatus } from "../../../application/ports/repositories/candidate.interface";

export class UpdateStatusUseCase {

  constructor(
    private readonly candidateRepo: ICandidateRepository
  ) { }

  async execute(candidateID: string, status: IStatus): Promise<void> {

    const candidate = await this.candidateRepo.getById(candidateID);

    if (!candidate) {
      throw new Error("Ứng viên không tồn tại");
    }

    await this.candidateRepo.updateStatus(candidateID, status);
  }
}