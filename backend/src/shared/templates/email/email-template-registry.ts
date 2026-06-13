// ============================================================
// Email Template Registry - Quản lý Prototype Pool
// ============================================================
// Registry lưu trữ tất cả prototype mẫu email đã đăng ký.
// Khi cần sử dụng, registry LUÔN trả về bản clone (không phải
// đối tượng gốc) để bảo vệ prototype không bị thay đổi.
// ============================================================

import {
  EmailTemplate,
  InterviewInvitationTemplate,
  InterviewResultTemplate,
  RejectionTemplate,
  ProgressUpdateTemplate,
  OfferEmailTemplate,
} from './email-template.prototype';

// Các key định danh cố định để truy xuất template theo id hoặc tên
export const EMAIL_TEMPLATE_KEYS = {
  INTERVIEW_INVITATION: 'interview_invitation', // id: 1
  INTERVIEW_RESULT: 'interview_result',         // id: 2
  REJECTION: 'rejection',                       // id: 3
  PROGRESS_UPDATE: 'progress_update',           // id: 4
  OFFER_NOTIFICATION: 'offer_notification',     // id: 5 — Dùng bởi OfferEmailDecorator
} as const;

export type EmailTemplateKey = typeof EMAIL_TEMPLATE_KEYS[keyof typeof EMAIL_TEMPLATE_KEYS];

// Ánh xạ từ id (frontend gửi lên) sang key registry
const TEMPLATE_ID_MAP: Record<number, EmailTemplateKey> = {
  1: EMAIL_TEMPLATE_KEYS.INTERVIEW_INVITATION,
  2: EMAIL_TEMPLATE_KEYS.INTERVIEW_RESULT,
  3: EMAIL_TEMPLATE_KEYS.REJECTION,
  4: EMAIL_TEMPLATE_KEYS.PROGRESS_UPDATE,
  5: EMAIL_TEMPLATE_KEYS.OFFER_NOTIFICATION,
};

// ─── Email Template Registry ─────────────────────────────────
export class EmailTemplateRegistry {
  private readonly registry = new Map<EmailTemplateKey, EmailTemplate>();

  // Đăng ký một prototype vào registry
  register(key: EmailTemplateKey, template: EmailTemplate): void {
    this.registry.set(key, template);
  }

  // Lấy bản clone của prototype theo key
  // Ném lỗi nếu key không tồn tại
  getByKey(key: EmailTemplateKey): EmailTemplate {
    const prototype = this.registry.get(key);
    if (!prototype) {
      throw new Error(`Không tìm thấy mẫu email với key: "${key}".`);
    }
    return prototype.clone();
  }

  // Lấy bản clone của prototype theo id (id từ frontend)
  getById(id: number): EmailTemplate {
    const key = TEMPLATE_ID_MAP[id];
    if (!key) {
      throw new Error(`Không tìm thấy mẫu email với id: ${id}.`);
    }
    return this.getByKey(key);
  }

  // Kiểm tra registry có hỗ trợ id này không
  hasId(id: number): boolean {
    return id in TEMPLATE_ID_MAP;
  }
}

// ─── Singleton: Registry đã đăng ký sẵn 4 mẫu mặc định ─────
function createDefaultRegistry(): EmailTemplateRegistry {
  const registry = new EmailTemplateRegistry();

  registry.register(EMAIL_TEMPLATE_KEYS.INTERVIEW_INVITATION, new InterviewInvitationTemplate());
  registry.register(EMAIL_TEMPLATE_KEYS.INTERVIEW_RESULT, new InterviewResultTemplate());
  registry.register(EMAIL_TEMPLATE_KEYS.REJECTION, new RejectionTemplate());
  registry.register(EMAIL_TEMPLATE_KEYS.PROGRESS_UPDATE, new ProgressUpdateTemplate());
  registry.register(EMAIL_TEMPLATE_KEYS.OFFER_NOTIFICATION, new OfferEmailTemplate());

  return registry;
}

export const defaultEmailTemplateRegistry = createDefaultRegistry();
