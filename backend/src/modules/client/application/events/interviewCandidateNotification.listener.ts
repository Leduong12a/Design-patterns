import type { EventListener } from './EventManager';
import type { InterviewScheduledPayload } from './interview.events';
import { INotificationStrategy, EmailNotificationStrategy, TelegramNotificationStrategy } from './notification.strategy';

export class InterviewCandidateNotificationListener implements EventListener {
  private strategy?: INotificationStrategy;

  // Setter chuẩn mực của Strategy Pattern
  public setStrategy(strategy: INotificationStrategy): void {
    this.strategy = strategy;
  }

  async update(payload: InterviewScheduledPayload): Promise<void> {
    const candidate = await payload.candidateRepo.getById(payload.candidateID);
    if (!candidate) {
      console.error(`[CandidateNotificationListener] Không tìm thấy thông tin ứng viên ${payload.candidateID}.`);
      return;
    }

    const availableStrategies = [
      new EmailNotificationStrategy(),
      new TelegramNotificationStrategy(),
    ];

    console.log('\n========================================================================');
    console.log(`[NotificationListener] 🔔 BẮT ĐẦU XỬ LÝ GỬI THÔNG BÁO LỊCH HẸN`);
    console.log(`👤 Ứng viên: ${candidate.getPersonal().fullName}`);
    console.log('========================================================================\n');

    for (const strategy of availableStrategies) {
      // 1. Thiết lập Strategy chuẩn SGK (setStrategy)
      this.setStrategy(strategy);

      // 2. Thực thi Strategy (execute)
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
