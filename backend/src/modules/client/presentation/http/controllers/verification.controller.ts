import { Request, Response } from 'express';
import { GetVerificationUseCase } from '../../../application/use-cases/verfication/get-verification.use-case';
import { VerifyCandidateUseCase } from '../../../application/use-cases/verfication/candidate-verify.use-case';
import { ConfirmVerifyUseCase } from '../../../application/use-cases/verfication/confirmVerify.use-case';
import { VerificationRepository } from '../../../infrastructure/database/repositories/verification.repository';
import { CandidateRepository } from '../../../infrastructure/database/repositories/candidate.repository';
import { asyncHandler } from '../../../../../shared/utils/asyncHandler';
import { NotFoundError, BadRequestError } from '../../../../../shared/utils/errors';

const verificationRepository = new VerificationRepository();
const candidateRepository = new CandidateRepository();

export const getVerificationDetail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const candidateID = req.params.candidateID as string;

  if (!candidateID) {
    throw new BadRequestError('Thiếu candidateID!');
  }

  const getVerificationUseCase = new GetVerificationUseCase(verificationRepository);
  const verification = await getVerificationUseCase.execute(candidateID);

  if (!verification) {
    throw new NotFoundError('Không tìm thấy dữ liệu kiểm chứng cho ứng viên này!');
  }

  res.status(200).json({
    success: true,
    message: 'Thành công',
    verification,
  });
});

export const verifyCandidate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { candidateID, data } = req.body;

  if (!candidateID) {
    throw new BadRequestError('Thiếu candidateID!');
  }

  if (!data) {
    throw new BadRequestError('Không có dữ liệu xác minh!');
  }

  const candidateVerifyUseCase = new VerifyCandidateUseCase(verificationRepository);

  const result = await candidateVerifyUseCase.execute(candidateID, data);

  res.status(200).json({ success: true, message: 'Xác minh thành công!', verification: result });
});

export const confirmVerification = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { candidateID, status } = req.body;

  if (!candidateID) {
    throw new BadRequestError('Thiếu candidateID!');
  }

  const useCase = new ConfirmVerifyUseCase(
    verificationRepository,
    candidateRepository,
    candidateRepository
  );

  const result = await useCase.execute(candidateID, status);

  res.status(200).json({
    success: true,
    message: result
  });
});
