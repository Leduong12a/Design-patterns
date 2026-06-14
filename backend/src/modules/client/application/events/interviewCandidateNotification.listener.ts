import type { EventListener } from './EventManager';
import type { InterviewScheduledPayload } from './interview.events';
import { INotificationStrategy, EmailNotificationStrategy, TelegramNotificationStrategy } from './notification.strategy';

export class InterviewCandidateNotificationListener implements EventListener {
  private readonly strategies: INotificationStrategy[];

  constructor() {
    this.strategies = [
      new EmailNotificationStrategy(),
      new TelegramNotificationStrategy(),
    ];
  }

  async update(payload: InterviewScheduledPayload): Promise<void> {
    const candidate = await payload.candidateRepo.getById(payload.candidateID);
    if (!candidate) {
      console.error(`[CandidateNotificationListener] Không tìm thấy thông tin ứng viên ${payload.candidateID}.`);
      return;
    }

    // Lọc ra các strategy mà candidate này hỗ trợ (dựa trên thông tin email/phone của họ)
    const activeStrategies = this.strategies.filter(strategy => strategy.supports(candidate));

    console.log('\n========================================================================');
    console.log(`[NotificationListener] 🔔 BẮT ĐẦU XỬ LÝ GỬI THÔNG BÁO LỊCH HẸN`);
    console.log(`👤 Ứng viên: ${candidate.getPersonal().fullName}`);
    console.log(`📌 Các kênh thông báo được kích hoạt:`);
    activeStrategies.forEach(s => console.log(`  - Kênh: ${s.constructor.name}`));
    console.log('========================================================================\n');

    if (activeStrategies.length === 0) {
      console.warn(`[CandidateNotificationListener] Ứng viên ${candidate.getPersonal().fullName} không hỗ trợ bất kỳ kênh thông báo nào.`);
      return;
    }

    // Chạy song song tất cả các strategy được hỗ trợ (Strategy List)
    await Promise.all(
      activeStrategies.map(async (strategy) => {
        try {
          await strategy.send(payload, candidate);
        } catch (error) {
          console.error(`[CandidateNotificationListener] Gặp lỗi khi gửi thông báo qua strategy ${strategy.constructor.name}:`, error);
        }
      })
    );
  }
}
