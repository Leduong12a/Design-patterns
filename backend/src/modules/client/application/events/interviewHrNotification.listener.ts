import type { EventListener } from './EventManager';
import type { InterviewScheduledPayload } from './interview.events';
import { IHrNotificationStrategy, EmailHrNotificationStrategy, TelegramHrNotificationStrategy } from './hrNotification.strategy';

export class InterviewHrNotificationListener implements EventListener {
  private strategy?: IHrNotificationStrategy;

  public setStrategy(strategy: IHrNotificationStrategy): void {
    this.strategy = strategy;
  }

  async update(payload: InterviewScheduledPayload): Promise<void> {
    const hr = await payload.userRepo.findUserByID(payload.userId);
    if (!hr) {
      console.error(`[HrNotificationListener] Không tìm thấy thông tin HR với userId=${payload.userId}.`);
      return;
    }

    const availableStrategies: IHrNotificationStrategy[] = [
      new EmailHrNotificationStrategy(),
      new TelegramHrNotificationStrategy(),
    ];

    console.log(`BẮT ĐẦU XỬ LÝ GỬI THÔNG BÁO CHO HR`);
    console.log(`HR: ${hr.getFullName() || 'HR'}`);

    for (const strategy of availableStrategies) {
      this.setStrategy(strategy);

      if (this.strategy && this.strategy.supports(hr)) {
        try {
          await this.strategy.send(payload, hr);
        } catch (error) {
          console.error(`[HrNotificationListener] Gặp lỗi khi gửi thông báo qua strategy ${strategy.constructor.name}:`, error);
        }
      }
    }
  }
}
