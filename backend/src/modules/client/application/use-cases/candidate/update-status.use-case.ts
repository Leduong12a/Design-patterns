import type { ICandidateReadRepo, ICandidateWriteRepo, IStatus } from "../../../application/ports/repositories/candidate.interface";

// Interface dùng chung cho UseCase gốc và tất cả Decorator bọc ngoài
// Decorator Pattern yêu cầu Decorator và Component gốc cùng implement một interface
export interface IUpdateStatusUseCase {
  execute(candidateID: string, status: IStatus): Promise<void>;
}

export class UpdateStatusUseCase implements IUpdateStatusUseCase {

  constructor(
    private readonly candidateRepo: ICandidateReadRepo & ICandidateWriteRepo
  ) { }

  async execute(candidateID: string, status: IStatus): Promise<void> {

    const candidate = await this.candidateRepo.getById(candidateID);

    if (!candidate) {
      throw new Error("Ứng viên không tồn tại");
    }

    await this.candidateRepo.updateStatus(candidateID, status);
  }
}