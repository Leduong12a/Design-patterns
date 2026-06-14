import axios from 'axios';
import { ITelegramService } from '../../application/ports/services/telegram.service';

export class TelegramService implements ITelegramService {
  private readonly token: string;
  private readonly defaultChatId: string;

  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN || '';
    this.defaultChatId = process.env.TELEGRAM_CHAT_ID || '';
    if (!this.token) {
      console.warn('[TelegramService] Thiếu cấu hình TELEGRAM_BOT_TOKEN trong .env. Tin nhắn Telegram sẽ được ghi ra console.');
    }
  }

  public async sendMessage(chatId: string, message: string): Promise<boolean> {
    const targetChatId = chatId || this.defaultChatId;
    if (!targetChatId) {
      console.warn('[TelegramService] Không có Chat ID để gửi tin nhắn.');
      return false;
    }

    if (!this.token) {
      console.log('========================================================================');
      console.log(`[Mock Telegram Service] ✈️ GỬI TELEGRAM MOCK (Do chưa cấu hình Token)`);
      console.log(`Gửi đến Chat ID: ${targetChatId}`);
      console.log(`Nội dung: "${message}"`);
      console.log('========================================================================');
      return true;
    }

    try {
      const url = `https://api.telegram.org/bot${this.token}/sendMessage`;
      const response = await axios.post(url, {
        chat_id: targetChatId,
        text: message,
        parse_mode: 'HTML',
      });

      if (response.data && response.data.ok) {
        console.log(`[TelegramService] ✅ Đã gửi tin nhắn Telegram thành công đến ${targetChatId}`);
        return true;
      } else {
        console.error('[TelegramService] ❌ Gửi tin nhắn thất bại:', response.data);
        return false;
      }
    } catch (error: any) {
      console.error('[TelegramService] ❌ Gặp lỗi khi gửi tin nhắn Telegram:', error?.response?.data || error?.message || error);
      return false;
    }
  }
}
