
import type { IAuthStrategy, ILoginResult } from './auth-strategy.interface';
import { AppError } from '../../../../../../shared/utils/errors';

// Lưu trữ in-memory trạng thái lockout tạm thời
interface ILockoutData {
  failedAttempts: number;
  lockoutUntil?: Date;
}

const lockoutMap = new Map<string, ILockoutData>();

export class SecurityAuthProxy implements IAuthStrategy {
  constructor(
    // Giữ tham chiếu đến "Subject" thực tế (Real Subject)
    private readonly realStrategy: IAuthStrategy,
    private readonly strategyName: string
  ) { }

  async authenticate(payload: any): Promise<ILoginResult> {
    const email = payload.email || 'unknown';
    console.log(`[SecurityAuthProxy] 🔒 [BẮT ĐẦU] Xác thực bằng strategy: "${this.strategyName}" cho email: "${email}"`);

    const now = new Date();
    const lockoutData = lockoutMap.get(email);

    // ── Bước 1: Kiểm soát truy cập (Brute-force checking) ──
    if (lockoutData && lockoutData.lockoutUntil && lockoutData.lockoutUntil > now) {
      const remainingSeconds = Math.ceil((lockoutData.lockoutUntil.getTime() - now.getTime()) / 1000);
      console.warn(`[SecurityAuthProxy] [BÌ CHẶN] Email "${email}" bị chặn do nhập sai nhiều lần. Thử lại sau: ${remainingSeconds}s`);
      throw new AppError(429, `Tài khoản tạm thời bị khóa do nhập sai nhiều lần. Vui lòng thử lại sau ${remainingSeconds} giây.`);
    }

    try {
      // ── Bước 2: Ủy thác xử lý cho strategy thực tế (Real Subject) ──
      const result = await this.realStrategy.authenticate(payload);

      // Nếu thành công → Reset số lần nhập sai
      if (lockoutMap.has(email)) {
        lockoutMap.delete(email);
      }

      console.log(`[SecurityAuthProxy] [THÀNH CÔNG] Xác thực thành công cho email: "${email}"`);
      return result;
    } catch (error: any) {
      // ── Bước 3: Đánh giá & xử lý lỗi bảo mật ──
      const attempts = lockoutData ? lockoutData.failedAttempts + 1 : 1;
      let lockoutTime: Date | undefined;

      if (attempts >= 3) {
        // Tạm khóa tài khoản 30 giây
        lockoutTime = new Date(Date.now() + 30 * 1000);
        console.warn(`[SecurityAuthProxy] KÍCH HOẠT KHÓA] Email "${email}" nhập sai ${attempts} lần. Khóa 30 giây.`);
      }

      lockoutMap.set(email, {
        failedAttempts: attempts,
        lockoutUntil: lockoutTime
      });

      console.error(`[SecurityAuthProxy] [THẤT BẠI] Xác thực thất bại cho email: "${email}". Lý do: ${error.message}. Lần thử: ${attempts}/3`);
      throw error;
    }
  }
}
