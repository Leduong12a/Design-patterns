
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
    
    private readonly wrappee: IUpdateStatusUseCase,
    
    private readonly candidateRepo: ICandidateReadRepo,
    
    private readonly mailSvc: IMailService,
  ) {}

  async execute(candidateID: string, status: IStatus): Promise<void> {
    
    await this.wrappee.execute(candidateID, status);

    if (status.status !== CandidateStatus.OFFER) {
      return; 
    }

    await this.sendOfferNotification(candidateID);
  }

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

      let jobTitle: string | undefined;
      const jobID = candidate.getJobID();
      if (jobID) {
        
        jobTitle = (candidate as any).jobTitle ?? undefined;
      }

      const emailTemplate = defaultEmailTemplateRegistry.getByKey(
        EMAIL_TEMPLATE_KEYS.OFFER_NOTIFICATION,
      );

      emailTemplate.replacePlaceholders(
        {
          fullName: personal.fullName,
          email: personal.email,
          phone: personal.phone,
        },
        jobTitle,
      );

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
      
      const e = error as { message?: string };
      console.error(`[OfferEmailDecorator] ❌ Lỗi khi gửi email: ${e.message ?? 'Lỗi không xác định'}`);
    }
  }
}
