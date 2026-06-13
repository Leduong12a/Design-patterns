// ============================================================
// Decorator Design Pattern — OfferEmailDecorator
// ============================================================
// Bọc (wrap) IUpdateStatusUseCase để thêm hành vi gửi email
// thông báo trúng tuyển khi status chuyển sang OFFER.
//
// Nguyên tắc:
//   1. Luôn gọi wrappee (use-case gốc) TRƯỚC — cập nhật DB.
//   2. Sau đó kiểm tra status: nếu là OFFER thì gửi email.
//   3. Lỗi mail KHÔNG làm rollback việc cập nhật status — chỉ log.
// ============================================================

import type { IStatus } from '../../../application/ports/repositories/candidate.interface';
import type { ICandidateReadRepo } from '../../../application/ports/repositories/candidate.interface';
import type { IMailService } from '../../../application/ports/services/mail.service';
import type { IUpdateStatusUseCase } from './update-status.use-case';
import { CandidateStatus } from '../../../domain/candidate';
import {
  defaultEmailTemplateRegistry,
  EMAIL_TEMPLATE_KEYS,
} from '../../../../../shared/templates/email/email-template-registry';

export class OfferEmailDecorator implements IUpdateStatusUseCase {
  constructor(
    // Use-case gốc được bọc vào — Decorator giữ tham chiếu tới "component"
    private readonly wrappee: IUpdateStatusUseCase,
    // Cần repo để lấy thông tin ứng viên (email, tên, job...) sau khi update
    private readonly candidateRepo: ICandidateReadRepo,
    // Dịch vụ gửi mail
    private readonly mailSvc: IMailService,
  ) {}

  async execute(candidateID: string, status: IStatus): Promise<void> {
    // ── Bước 1: Gọi use-case gốc — cập nhật trạng thái vào DB ──
    await this.wrappee.execute(candidateID, status);

    // ── Bước 2: Kiểm tra — chỉ gửi email khi chuyển sang OFFER ─
    if (status.status !== CandidateStatus.OFFER) {
      return; // Trạng thái khác → Decorator không làm gì thêm
    }

    // ── Bước 3: Lấy thông tin ứng viên để cá nhân hóa email ────
    await this.sendOfferNotification(candidateID);
  }

  // Gửi email thông báo trúng tuyển — tách riêng để dễ đọc
  private async sendOfferNotification(candidateID: string): Promise<void> {
    try {
      const candidate = await this.candidateRepo.getById(candidateID);

      if (!candidate) {
        console.warn(`[OfferEmailDecorator] Không tìm thấy ứng viên ${candidateID} để gửi email.`);
        return;
      }

      const personal = candidate.getPersonal();
      if (!personal?.email) {
        console.warn(`[OfferEmailDecorator] Ứng viên ${candidateID} không có email — bỏ qua.`);
        return;
      }

      // Lấy tiêu đề công việc nếu có
      let jobTitle: string | undefined;
      const jobID = candidate.getJobID();
      if (jobID) {
        // jobTitle được lấy gián tiếp qua entity nếu đã được gắn sẵn
        jobTitle = (candidate as any).jobTitle ?? undefined;
      }

      // Clone OfferEmailTemplate từ Prototype Registry
      // → đảm bảo mỗi lần gửi là một bản sao riêng biệt, không ảnh hưởng prototype gốc
      const emailTemplate = defaultEmailTemplateRegistry.getByKey(
        EMAIL_TEMPLATE_KEYS.OFFER_NOTIFICATION,
      );

      // Điền thông tin ứng viên vào bản clone
      emailTemplate.replacePlaceholders(
        {
          fullName: personal.fullName,
          email: personal.email,
          phone: personal.phone,
        },
        jobTitle,
      );

      // Gửi email
      const sent = await this.mailSvc.sendEmail(
        personal.email,
        emailTemplate.title,
        emailTemplate.toHtml(),
      );

      if (sent) {
        console.log(`[OfferEmailDecorator] ✅ Đã gửi email trúng tuyển tới: ${personal.email}`);
      } else {
        console.warn(`[OfferEmailDecorator] ⚠️ Gửi email thất bại cho ứng viên: ${candidateID}`);
      }
    } catch (error: unknown) {
      // Gửi email lỗi → CHỈ log, không throw — tránh rollback việc update status
      const e = error as { message?: string };
      console.error(`[OfferEmailDecorator] ❌ Lỗi khi gửi email: ${e.message ?? 'Lỗi không xác định'}`);
    }
  }
}
