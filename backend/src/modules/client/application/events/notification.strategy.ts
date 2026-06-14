import type { InterviewScheduledPayload } from './interview.events';
import { TelegramService } from '../../infrastructure/external-service/telegram.service';

export interface INotificationStrategy {
  supports(candidate: any): boolean;
  send(payload: InterviewScheduledPayload, candidate: any): Promise<void>;
}

export class EmailNotificationStrategy implements INotificationStrategy {
  supports(candidate: any): boolean {
    const personal = candidate.getPersonal();
    return !!(personal && personal.email);
  }

  async send(payload: InterviewScheduledPayload, candidate: any): Promise<void> {
    const personal = candidate.getPersonal();
    const email = personal.email;
    
    console.log(`[EmailStrategy] 📧 Đang tạo và gửi email mời phỏng vấn đến: ${email}...`);
    const job = payload.jobID ? await payload.jobRepo.getById(payload.jobID) : null;
    const jobTitle = job ? job.getTitle() : 'Vị trí ứng tuyển';

    const analysis = await payload.aiAnalysisRepo.getAnalysisByCandidateId(payload.candidateID);
    if (!analysis) {
      console.warn(`[EmailStrategy] Ứng viên ${payload.candidateID} chưa được AI phân tích.`);
    }

    const { buildInterviewCalendarInvite } = await import('../../infrastructure/external-service/calendarInvite.service');

    const invite = buildInterviewCalendarInvite({
      uid: `${payload.schedule.id ?? payload.candidateID}@hr-agent`,
      startTime: payload.time,
      durationMinutes: payload.durationMinutes,
      summary: `Phong van - ${jobTitle}`,
      description: [
        `Phong van vi tri: ${jobTitle}`,
        `Ghi chu: ${payload.notes ?? ''}`,
      ].filter(Boolean).join('\n'),
      location: payload.address,
      organizerEmail: process.env.MAIL_USER,
      attendeeEmail: email,
    });

    const emailPayload = {
      candidate: {
        fullName: personal.fullName,
        email: email,
      },
      job: job ? job.getDetailJob() : { title: jobTitle },
      schedule: {
        time: payload.time.toISOString(),
        durationMinutes: payload.durationMinutes,
        address: payload.address,
      },
      aiAnalysis: analysis || { topSkills: [], analysisContent: 'Không có dữ liệu phân tích.' },
      notes: payload.notes ?? '',
    };

    let subject = `Thu moi phong van - ${jobTitle}`;
    let html = `<p>Xin chao ${personal.fullName || 'ban'},</p><p>Chung toi xin moi ban tham gia phong van cho vi tri <b>${jobTitle}</b>.</p>`;

    try {
      const generated = await payload.geminiSvc.generateInterviewEmail(emailPayload);
      if (generated?.subject) subject = generated.subject.trim();
      if (generated?.html) html = generated.html;
    } catch (err) {
      console.error('[EmailStrategy] Lỗi khi tạo template email bằng AI, sử dụng email mặc định:', err);
    }

    await payload.mailSvc.sendEmail(email, subject, html, [
      {
        filename: invite.filename,
        content: invite.content,
        contentType: invite.contentType,
      },
    ]);
    console.log(`[EmailStrategy] ✅ Đã gửi email mời phỏng vấn thành công đến: ${email}`);
  }
}

export class TelegramNotificationStrategy implements INotificationStrategy {
  private readonly telegramService = new TelegramService();

  supports(candidate: any): boolean {
    return true;
  }

  async send(payload: InterviewScheduledPayload, candidate: any): Promise<void> {
    const hr = await payload.userRepo.findUserByID(payload.userId);
    if (!hr || !hr.getTelegramNotificationSubscribed()) {
      console.log(`[TelegramStrategy] 🔇 HR (userId=${payload.userId}) đã TẮT nhận thông báo Telegram.`);
      return;
    }

    const personal = candidate.getPersonal();
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
    console.log(`[TelegramStrategy] ✈️ Đang gửi thông báo Telegram đến Chat ID: ${targetChatId}...`);

    const message = `🔔 <b>LỊCH HẸN PHỎNG VẤN MỚI</b>\n\n` +
      `👤 <b>Ứng viên:</b> ${personal.fullName}\n` +
      `💼 <b>Vị trí:</b> ${jobTitle}\n` +
      `📅 <b>Thời gian:</b> ${timeString}\n` +
      `📍 <b>Địa điểm:</b> ${payload.address}\n` +
      `📝 <b>Ghi chú:</b> ${payload.notes ?? 'Không có'}`;
    
    await this.telegramService.sendMessage('', message);
  }
}
