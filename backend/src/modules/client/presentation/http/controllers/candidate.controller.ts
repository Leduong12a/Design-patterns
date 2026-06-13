import { Request, Response } from 'express';
import { GetCandidatesUseCase } from '../../../application/use-cases/candidate/get-candidate.use-case';
import { GetCandidateDetailUseCase } from '../../../application/use-cases/candidate/get-candidate-detail.use-case';
import { UpdateStatusUseCase } from '../../../application/use-cases/candidate/update-status.use-case';
import { OfferEmailDecorator } from '../../../application/use-cases/candidate/offer-email.decorator';
import { CandidateRepository } from '../../../infrastructure/database/repositories/candidate.repository';
import { MailService } from '../../../infrastructure/external-service/mail.service';
import { CandidateStatus } from '../../../domain/candidate';
import { asyncHandler } from '../../../../../shared/utils/asyncHandler';
import { NotFoundError, BadRequestError } from '../../../../../shared/utils/errors';

const candidateRepository = new CandidateRepository();

// [GET] /candidates
export const getCandidates = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userID: string = res.locals.user.id.toString() || "";

  const getCandidatesUseCase = new GetCandidatesUseCase(candidateRepository);
  const candidates = await getCandidatesUseCase.execute(userID);

  if (!candidates || candidates.length === 0) {
    res.status(200).json({ success: true, message: 'Vui lòng thêm ứng viên!', candidates: [] });
    return;
  }

  res.status(200).json({ success: true, message: 'Thành công', candidates: candidates });
});

// [GET] /candidates/:candidateID
export const getCandidateDetail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const candidateID = req.params.candidateID as string;

  if (!candidateID) {
    throw new BadRequestError('Thiếu candidateID!');
  }

  const getCandidateDetailUseCase = new GetCandidateDetailUseCase(candidateRepository);
  const candidateDetail = await getCandidateDetailUseCase.execute(candidateID);

  if (!candidateDetail) {
    throw new NotFoundError('Không tìm thấy ứng viên!');
  }

  res.status(200).json({
    success: true,
    message: 'Thành công',
    candidate: candidateDetail
  });
});

// [PATCH] /candidates/change-status/:id
export const updateStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id: string = req.params.id?.toString() || '';
  const { status } = req.body;

  if (!id) throw new BadRequestError('ID ứng viên không hợp lệ.');

  const validStatuses = Object.values(CandidateStatus);
  if (!validStatuses.includes(status as any)) {
    throw new BadRequestError(`Trạng thái không hợp lệ. Các trạng thái cho phép: ${validStatuses.join(', ')}`);
  }

  // ── Decorator Pattern ──────────────────────────────────────────────────────
  // Controller chỉ biết interface IUpdateStatusUseCase.
  // OfferEmailDecorator bọc UpdateStatusUseCase:
  //   - Cập nhật DB (do UpdateStatusUseCase thực hiện bên trong)
  //   - Nếu status === "offer" → tự động gửi email thông báo trúng tuyển
  // ─────────────────────────────────────────────────────────────────────────
  const baseUseCase = new UpdateStatusUseCase(candidateRepository);
  const updateStatusUseCase = new OfferEmailDecorator(
    baseUseCase,
    candidateRepository,
    new MailService(),
  );

  await updateStatusUseCase.execute(id, { status: status as any });

  res.status(200).json({
    success: true,
    message: 'Cập nhật trạng thái thành công.',
  });
});