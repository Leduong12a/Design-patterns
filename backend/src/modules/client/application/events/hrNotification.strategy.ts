import type { InterviewScheduledPayload } from './interview.events';
import { TelegramService } from '../../infrastructure/external-service/telegram.service';

export interface IHrNotificationStrategy {

  supports(hr: any): boolean;


  send(payload: InterviewScheduledPayload, hr: any): Promise<void>;
}

export class EmailHrNotificationStrategy implements IHrNotificationStrategy {
  supports(hr: any): boolean {
    if (!hr) return false;
    return Boolean(hr.getInterviewNotificationSubscribed());
  }

  async send(payload: InterviewScheduledPayload, hr: any): Promise<void> {
    const candidate = await payload.candidateRepo.getById(payload.candidateID);
    const job = payload.jobID ? await payload.jobRepo.getById(payload.jobID) : null;

    const candidateName = candidate?.getPersonal().fullName || 'ung vien';
    const jobTitle = job?.getTitle() || 'vi tri tuyen dung';
    const interviewTime = payload.time.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    console.log(`[EmailHrStrategy] Đang gửi email thông báo lịch hẹn cho HR: ${hr.getEmail()}`);
    await payload.mailSvc.sendEmail(
      hr.getEmail(),
      `Thong bao lich phong van - ${candidateName}`,
      `
        <p>Xin chao ${hr.getFullName() || 'HR'},</p>
        <p>Lich phong van moi da duoc dat thanh cong.</p>
        <ul>
          <li>Ung vien: <b>${candidateName}</b></li>
          <li>Vi tri: <b>${jobTitle}</b></li>
          <li>Thoi gian: <b>${interviewTime}</b></li>
          <li>Dia diem / link: <b>${payload.address}</b></li>
        </ul>
      `,
    );
  }
}

export class TelegramHrNotificationStrategy implements IHrNotificationStrategy {
  private readonly telegramService = new TelegramService();

  supports(hr: any): boolean {
    if (!hr) return false;
    return Boolean(hr.getTelegramNotificationSubscribed());
  }

  async send(payload: InterviewScheduledPayload, hr: any): Promise<void> {
    const candidate = await payload.candidateRepo.getById(payload.candidateID);
    const personal = candidate ? candidate.getPersonal() : { fullName: 'Ứng viên' };
    const job = payload.jobID ? await payload.jobRepo.getById(payload.jobID) : null;
    const jobTitle = job ? job.getTitle() : 'Vị trí ứng tuyển';
    const timeString = payload.time.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const targetChatId = process.env.TELEGRAM_CHAT_ID || 'Chưa cấu hình';
    console.log(`[TelegramHrStrategy] ✈️ Đang gửi thông báo Telegram đến Chat ID: ${targetChatId}...`);

    const message = `🔔 <b>LỊCH HẸN PHỎNG VẤN MỚI</b>\n\n` +
      `👤 <b>Ứng viên:</b> ${personal.fullName}\n` +
      `💼 <b>Vị trí:</b> ${jobTitle}\n` +
      `📅 <b>Thời gian:</b> ${timeString}\n` +
      `📍 <b>Địa điểm:</b> ${payload.address}\n` +
      `📝 <b>Ghi chú:</b> ${payload.notes ?? 'Không có'}`;
    
    await this.telegramService.sendMessage('', message);
  }
}
