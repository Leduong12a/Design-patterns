import type { EventListener } from './EventManager';
import type { InterviewScheduledPayload } from './interview.events';
import { ICandidateNotificationStrategy, EmailCandidateNotificationStrategy } from './notification.strategy';

export class InterviewCandidateNotificationListener implements EventListener {
  private strategy?: ICandidateNotificationStrategy;

  public setStrategy(strategy: ICandidateNotificationStrategy): void {
    this.strategy = strategy;
  }

  async update(payload: InterviewScheduledPayload): Promise<void> {
    const candidate = await payload.candidateRepo.getById(payload.candidateID);
    if (!candidate) {
      console.error(`[CandidateNotificationListener] Không tìm thấy thông tin ứng viên ${payload.candidateID}.`);
      return;
    }

    const availableStrategies: ICandidateNotificationStrategy[] = [
      new EmailCandidateNotificationStrategy(),
    ];

    console.log(`BẮT ĐẦU XỬ LÝ GỬI THÔNG BÁO CHO ỨNG VIÊN`);
    console.log(`Ứng viên: ${candidate.getPersonal().fullName}`);

    for (const strategy of availableStrategies) {
      this.setStrategy(strategy);

      if (this.strategy && this.strategy.supports(candidate)) {
        try {
          await this.strategy.send(payload, candidate);
        } catch (error) {
          console.error(`[CandidateNotificationListener] Gặp lỗi khi gửi thông báo qua strategy ${strategy.constructor.name}:`, error);
        }
      }
    }
  }
}
