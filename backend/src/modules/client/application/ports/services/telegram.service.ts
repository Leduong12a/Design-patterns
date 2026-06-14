export interface ITelegramService {
  sendMessage(chatId: string, message: string): Promise<boolean>;
}
