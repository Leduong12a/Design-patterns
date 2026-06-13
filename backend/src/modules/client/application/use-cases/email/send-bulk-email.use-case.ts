import type { ICandidateReadRepo } from '../../../application/ports/repositories/candidate.interface';
import type { IJobReadRepo } from '../../../application/ports/repositories/job.interface';
import type { IMailService } from '../../../application/ports/services/mail.service';
import { defaultEmailTemplateRegistry } from '../../../../../shared/templates/email/email-template-registry';

export interface SendBulkEmailInput {
  candidateIds: string[];
  template: {
    id: number;
    name: string;
  };
  title: string;
  content: string;
}

export interface SendBulkEmailResult {
  success: true;
  message: string;
  totalSent: number;
  failed: Array<{
    candidateId: string;
    candidateName?: string;
    error: string;
  }>;
}

export class SendBulkEmailUseCase {
  constructor(
    private readonly candidateRepo: ICandidateReadRepo,
    private readonly jobRepo: IJobReadRepo,
    private readonly mailSvc: IMailService,
  ) { }

  async execute(input: SendBulkEmailInput): Promise<SendBulkEmailResult> {
    if (!input.candidateIds || input.candidateIds.length === 0) {
      throw new Error('Danh sách ứng viên không được để trống.');
    }

    const failed: Array<{
      candidateId: string;
      candidateName?: string;
      error: string;
    }> = [];
    let totalSent = 0;

    // Tải toàn bộ ứng viên song song
    const candidates = await Promise.all(
      input.candidateIds.map(id => this.candidateRepo.getById(id)),
    );

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const candidateId = input.candidateIds[i]!;

      try {
        if (!candidate) {
          failed.push({ candidateId, error: 'Không tìm thấy ứng viên.' });
          continue;
        }

        const personal = candidate.getPersonal();
        if (!personal?.email) {
          failed.push({
            candidateId,
            candidateName: personal?.fullName,
            error: 'Ứng viên không có email.',
          });
          continue;
        }

        // Lấy tiêu đề công việc nếu có
        let jobTitle: string | undefined;
        const jobID = candidate.getJobID();
        if (jobID) {
          try {
            const job = await this.jobRepo.getById(jobID.toString());
            jobTitle = job?.getTitle();
          } catch {
            console.warn(`Could not fetch job for candidate ${candidateId}`);
          }
        }

        // ── Prototype Pattern ────────────────────────────────────────
        // Nếu template id được hỗ trợ trong registry → clone từ prototype gốc.
        // Nếu không (template tùy chỉnh từ frontend) → dùng EmailTemplate
        // với title/content do người dùng nhập, rồi điền placeholder.
        // ────────────────────────────────────────────────────────────
        let emailTemplate;

        if (defaultEmailTemplateRegistry.hasId(input.template.id)) {
          // Lấy bản clone từ Prototype Registry → đảm bảo không ảnh hưởng mẫu gốc
          emailTemplate = defaultEmailTemplateRegistry.getById(input.template.id);
        } else {
          // Template tùy chỉnh: vẫn dùng base EmailTemplate để tận dụng logic chung
          const { EmailTemplate } = await import('../../../../../shared/templates/email/email-template.prototype');
          emailTemplate = new EmailTemplate(input.title, input.content);
        }

        // Điền thông tin ứng viên và vị trí vào bản clone
        emailTemplate.replacePlaceholders(
          {
            fullName: personal.fullName,
            email: personal.email,
            phone: personal.phone,
          },
          jobTitle,
        );

        // Render ra HTML hoàn chỉnh từ bản clone đã cá nhân hóa
        const htmlContent = emailTemplate.toHtml();

        const sent = await this.mailSvc.sendEmail(
          personal.email,
          emailTemplate.title,
          htmlContent,
        );

        if (sent) {
          totalSent++;
        } else {
          failed.push({
            candidateId,
            candidateName: personal?.fullName,
            error: 'Lỗi gửi email từ dịch vụ mail.',
          });
        }
      } catch (error: unknown) {
        const e = error as { message?: string };
        const personal = candidate?.getPersonal();
        failed.push({
          candidateId,
          candidateName: personal?.fullName,
          error: e.message ?? 'Lỗi không xác định.',
        });
      }
    }

    return {
      success: true,
      message: `Gửi email thành công tới ${totalSent}/${input.candidateIds.length} ứng viên.`,
      totalSent,
      failed,
    };
  }
}
