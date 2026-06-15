import type { InterviewScheduledPayload } from './interview.events';

export interface ICandidateNotificationStrategy {
  supports(candidate: any): boolean;
  send(payload: InterviewScheduledPayload, candidate: any): Promise<void>;
}

export class EmailCandidateNotificationStrategy implements ICandidateNotificationStrategy {
  supports(candidate: any): boolean {
    const personal = candidate.getPersonal();
    if (personal === null || personal === undefined) {
      return false; 
    }
    
    if (personal.email === null || personal.email === undefined || personal.email === '') {
      return false; 
    }
    
    return true; 
  }

  async send(payload: InterviewScheduledPayload, candidate: any): Promise<void> {
    const personal = candidate.getPersonal();
    const email = personal.email;
    
    console.log(`[EmailCandidateStrategy] Đang tạo và gửi email mời phỏng vấn đến: ${email}...`);
    const job = payload.jobID ? await payload.jobRepo.getById(payload.jobID) : null;
    const jobTitle = job ? job.getTitle() : 'Vị trí ứng tuyển';

    const analysis = await payload.aiAnalysisRepo.getAnalysisByCandidateId(payload.candidateID);
    if (!analysis) {
      console.warn(`[EmailCandidateStrategy] Ứng viên ${payload.candidateID} chưa được AI phân tích.`);
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
      const generated = await payload.geminiSvc.execute(emailPayload);
      if (generated?.subject) subject = generated.subject.trim();
      if (generated?.html) html = generated.html;
    } catch (err) {
      console.error('[EmailCandidateStrategy] Lỗi khi tạo template email bằng AI, sử dụng email mặc định:', err);
    }

    await payload.mailSvc.sendEmail(email, subject, html, [
      {
        filename: invite.filename,
        content: invite.content,
        contentType: invite.contentType,
      },
    ]);
    console.log(`[EmailCandidateStrategy] Đã gửi email mời phỏng vấn thành công đến: ${email}`);
  }
}
