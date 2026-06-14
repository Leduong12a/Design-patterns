import { ICandidateRepository, ICanidateWithScore } from "../../../application/ports/repositories/candidate.interface";

export class GetCanidateByJobUseCase {
  constructor(
    private readonly candidateRepo: ICandidateRepository
  ) { }

  async execute(jobID: string): Promise<ICanidateWithScore[]> {

    const candidatesWithScore = await this.candidateRepo.getCanidateByJob(jobID);

    return candidatesWithScore;
  }
}