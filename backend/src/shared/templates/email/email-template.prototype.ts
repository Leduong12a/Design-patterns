
// ============================================================

// ─── Interface Prototype ────────────────────────────────────
export interface Prototype<T> {
  clone(): T;
}

// ─── Dữ liệu ứng viên dùng để điền placeholder ──────────────
export interface CandidateInfo {
  fullName?: string;
  email?: string;
  phone?: string;
}

// ─── Base Class: EmailTemplate ──────────────────────────────
export class EmailTemplate implements Prototype<EmailTemplate> {
  constructor(
    public title: string,
    public content: string,
  ) {}

  // Nhân bản prototype: tạo một bản sao độc lập của template
  clone(): EmailTemplate {
    return new EmailTemplate(this.title, this.content);
  }

  // Điền thông tin ứng viên và vị trí công việc vào các placeholder
  replacePlaceholders(candidate: CandidateInfo, jobTitle?: string): this {
    const company = process.env.COMPANY_NAME || 'công ty chúng tôi';

    if (candidate.fullName) {
      this.title = this.title.replace(/\[Tên Ứng Viên\]/g, candidate.fullName);
      this.content = this.content.replace(/\[Tên Ứng Viên\]/g, candidate.fullName);
      this.content = this.content.replace(/\[Tên Ứng viên\]/g, candidate.fullName);
    }

    if (candidate.email) {
      this.content = this.content.replace(/\[Email\]/g, candidate.email);
    }

    if (candidate.phone) {
      this.content = this.content.replace(/\[Điện thoại\]/g, candidate.phone);
      this.content = this.content.replace(/\[SĐT\]/g, candidate.phone);
    }

    if (jobTitle) {
      this.title = this.title.replace(/\[Tên Vị Trí\]/g, jobTitle);
      this.content = this.content.replace(/\[Tên Vị Trí\]/g, jobTitle);
      this.content = this.content.replace(/\[Vị Trí\]/g, jobTitle);
    }

    this.content = this.content.replace(/\[Công ty\]/g, company);
    this.title = this.title.replace(/\[Công ty\]/g, company);

    return this;
  }

  // Render nội dung thành HTML email hoàn chỉnh
  toHtml(): string {
    const paragraphs = this.content
      .split('\n')
      .map(line => (line.trim() ? `<p style="margin: 0 0 10px 0;">${line}</p>` : '<br/>'))
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <div style="border-bottom: 2px solid #007bff; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="color: #333; font-size: 20px; margin: 0;">${this.title}</h2>
          </div>
          <div style="color: #555; font-size: 15px; line-height: 1.7;">
            ${paragraphs}
          </div>
          <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 16px; color: #999; font-size: 12px; text-align: center;">
            <p style="margin: 4px 0;">&copy; ${new Date().getFullYear()} HR Agent. All rights reserved.</p>
            <p style="margin: 0;">Hệ thống tuyển dụng thông minh</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// ─── Concrete Prototype 1: Thư mời phỏng vấn ───────────────
export class InterviewInvitationTemplate extends EmailTemplate {
  constructor() {
    super(
      '[HR-Agent] Thư mời phỏng vấn vị trí [Tên Vị Trí]',
      `Thân gửi [Tên Ứng Viên],

Cảm ơn bạn đã ứng tuyển vị trí [Tên Vị Trí] tại công ty chúng tôi. Hệ thống và đội tuyển dụng rất ấn tượng với các kỹ năng của bạn.

Chúng tôi rất muốn tìm hiểu thêm về bạn thông qua một cuộc phỏng vấn. Dưới đây là thông tin buổi phỏng vấn:

- Thời gian: [Giờ] ngày [Ngày/Tháng/Năm]
- Hình thức: Phỏng vấn trực tuyến qua Google Meet
- Link tham gia: [Link Google Meet]
- Người phỏng vấn: [Tên người phỏng vấn]

Vui lòng xác nhận tham gia qua email này để chúng tôi sắp xếp lịch thích hợp. Nếu bạn không thể tham gia vào thời gian trên, vui lòng liên hệ với chúng tôi sớm.

Trân trọng,
[Tên Chuyên Viên / Công ty]`,
    );
  }

  override clone(): InterviewInvitationTemplate {
    const copy = new InterviewInvitationTemplate();
    copy.title = this.title;
    copy.content = this.content;
    return copy;
  }
}

// ─── Concrete Prototype 2: Kết quả phỏng vấn ───────────────
export class InterviewResultTemplate extends EmailTemplate {
  constructor() {
    super(
      '[HR-Agent] Kết quả phỏng vấn',
      `Thân gửi [Tên Ứng Viên],

Cảm ơn bạn đã dành thời gian tham gia buổi phỏng vấn cho vị trí [Tên Vị Trí]. Đây là cơ hội tốt để chúng tôi tìm hiểu rõ hơn về kinh nghiệm và kỹ năng của bạn.

Sau khi xem xét kỹ lưỡng, chúng tôi quyết định tiếp tục với vòng phỏng vấn tiếp theo. Chúng tôi sẽ liên hệ với bạn trong vòng [X] ngày để sắp xếp lịch.

Nếu bạn có bất kỳ câu hỏi nào, vui lòng không ngần ngại liên hệ với chúng tôi.

Trân trọng,
[Tên Chuyên Viên / Công ty]`,
    );
  }

  override clone(): InterviewResultTemplate {
    const copy = new InterviewResultTemplate();
    copy.title = this.title;
    copy.content = this.content;
    return copy;
  }
}

// ─── Concrete Prototype 3: Thư từ chối ứng tuyển ───────────
export class RejectionTemplate extends EmailTemplate {
  constructor() {
    super(
      '[HR-Agent] Thư từ chối ứng tuyển',
      `Thân gửi [Tên Ứng Viên],

Cảm ơn bạn đã ứng tuyển và tham gia phỏng vấn cho vị trí [Tên Vị Trí] tại công ty chúng tôi. Chúng tôi đánh giá cao sự nỗ lực và kinh nghiệm của bạn.

Tuy nhiên, sau khi xem xét toàn bộ các ứng viên, chúng tôi quyết định tiếp tục với các ứng viên khác có kinh nghiệm phù hợp hơn với vị trí này.

Chúng tôi hy vọng sẽ có cơ hội hợp tác với bạn trong tương lai. Vui lòng theo dõi các cơ hội việc làm khác trên website của chúng tôi.

Trân trọng,
[Tên Chuyên Viên / Công ty]`,
    );
  }

  override clone(): RejectionTemplate {
    const copy = new RejectionTemplate();
    copy.title = this.title;
    copy.content = this.content;
    return copy;
  }
}

// ─── Concrete Prototype 4: Cập nhật tiến độ hồ sơ ──────────
export class ProgressUpdateTemplate extends EmailTemplate {
  constructor() {
    super(
      '[HR-Agent] Thư chào hỏi cập nhật tiến độ',
      `Thân gửi [Tên Ứng Viên],

Chúng tôi muốn cập nhật cho bạn về tiến độ của hồ sơ ứng tuyển vị trí [Tên Vị Trí].

Hiện tại, hồ sơ của bạn đang được xem xét kỹ lưỡng bởi đội tuyển dụng. Chúng tôi sẽ liên hệ với bạn trong vòng [X] ngày nữa để thông báo kết quả hoặc sắp xếp vòng phỏng vấn tiếp theo.

Nếu bạn có bất kỳ câu hỏi hay cần thêm thông tin, vui lòng liên hệ với chúng tôi.

Trân trọng,
[Tên Chuyên Viên / Công ty]`,
    );
  }

  override clone(): ProgressUpdateTemplate {
    const copy = new ProgressUpdateTemplate();
    copy.title = this.title;
    copy.content = this.content;
    return copy;
  }
}

// ─── Concrete Prototype 5: Thư thông báo trúng tuyển (Offer) ─
export class OfferEmailTemplate extends EmailTemplate {
  constructor() {
    super(
      '[HR-Agent] Chúc mừng! Bạn đã được nhận vào vị trí [Tên Vị Trí]',
      `Thân gửi [Tên Ứng Viên],

Chúng tôi rất vui được thông báo rằng bạn đã vượt qua tất cả các vòng tuyển dụng và được chính thức nhận vào vị trí [Tên Vị Trí] tại [Công ty].

Đội ngũ tuyển dụng của chúng tôi đã ấn tượng với kinh nghiệm, kỹ năng và thái độ chuyên nghiệp của bạn trong suốt quá trình phỏng vấn.

Các bước tiếp theo:
- Bộ phận HR sẽ liên hệ với bạn trong vòng 1-2 ngày làm việc để thông báo ngày bắt đầu và các thủ tục nhận việc.
- Vui lòng chuẩn bị các giấy tờ cần thiết (CMND/CCCD, bằng cấp, ảnh 3x4...) để hoàn tất hồ sơ.
- Nếu có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi qua email này.

Một lần nữa, chúc mừng bạn và chào mừng bạn đến với [Công ty]!

Trân trọng,
[Tên Chuyên Viên / Công ty]`,
    );
  }

  override clone(): OfferEmailTemplate {
    const copy = new OfferEmailTemplate();
    copy.title = this.title;
    copy.content = this.content;
    return copy;
  }
}
