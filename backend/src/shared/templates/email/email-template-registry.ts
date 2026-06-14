
import {
  EmailTemplate,
  InterviewInvitationTemplate,
  InterviewResultTemplate,
  RejectionTemplate,
  ProgressUpdateTemplate,
  OfferEmailTemplate,
} from './email-template.prototype';

export const EMAIL_TEMPLATE_KEYS = {
  INTERVIEW_INVITATION: 'interview_invitation', 
  INTERVIEW_RESULT: 'interview_result',         
  REJECTION: 'rejection',                       
  PROGRESS_UPDATE: 'progress_update',           
  OFFER_NOTIFICATION: 'offer_notification',     
} as const;

export type EmailTemplateKey = typeof EMAIL_TEMPLATE_KEYS[keyof typeof EMAIL_TEMPLATE_KEYS];

const TEMPLATE_ID_MAP: Record<number, EmailTemplateKey> = {
  1: EMAIL_TEMPLATE_KEYS.INTERVIEW_INVITATION,
  2: EMAIL_TEMPLATE_KEYS.INTERVIEW_RESULT,
  3: EMAIL_TEMPLATE_KEYS.REJECTION,
  4: EMAIL_TEMPLATE_KEYS.PROGRESS_UPDATE,
  5: EMAIL_TEMPLATE_KEYS.OFFER_NOTIFICATION,
};

export class EmailTemplateRegistry {
  private readonly registry = new Map<EmailTemplateKey, EmailTemplate>();

  register(key: EmailTemplateKey, template: EmailTemplate): void {
    this.registry.set(key, template);
  }

  getByKey(key: EmailTemplateKey): EmailTemplate {
    const prototype = this.registry.get(key);
    if (!prototype) {
      throw new Error(`Không tìm thấy mẫu email với key: "${key}".`);
    }
    return prototype.clone();
  }

  getById(id: number): EmailTemplate {
    const key = TEMPLATE_ID_MAP[id];
    if (!key) {
      throw new Error(`Không tìm thấy mẫu email với id: ${id}.`);
    }
    return this.getByKey(key);
  }

  hasId(id: number): boolean {
    return id in TEMPLATE_ID_MAP;
  }
}

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
