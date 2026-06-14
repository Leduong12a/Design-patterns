import type { IAuth } from '../../../ports/repositories/auth.interface';
import type { IOTPReadRepo, IOTPWriteRepo } from '../../../ports/repositories/otp.interface';
import type { ITokenService, ITokenPayload } from '../../../ports/services/token.service';
import type { IAuthStrategy, ILoginResult } from './auth-strategy.interface';

export class OtpStrategy implements IAuthStrategy {
  constructor(
    private readonly authRepo: IAuth,
    private readonly otpRepo: IOTPReadRepo & IOTPWriteRepo,
    private readonly tokService: ITokenService,
  ) {}

  async authenticate(payload: any): Promise<ILoginResult> {
    const { email, otp } = payload;
    if (!email || !otp) {
      throw new Error('Thiếu Email hoặc mã OTP!');
    }

    const user = await this.authRepo.findUserByEmail(email);
    if (!user) {
      throw new Error('Email không tồn tại!');
    }

    if (!user.isActive()) {
      throw new Error('Tài khoản đã bị khóa! Vui lòng liên hệ Admin.');
    }

    // Verify OTP
    const resultOtp = await this.otpRepo.findByEmailAndOTP(email, otp);
    if (!resultOtp) {
      throw new Error('Mã OTP không chính xác!');
    }

    if (resultOtp.isExpired()) {
      throw new Error('Mã OTP đã hết hạn, vui lòng yêu cầu mã mới!');
    }

    // Delete OTP once verified to prevent reuse
    await this.otpRepo.deleteOTP(email);

    const tokenPayload: ITokenPayload = {
      userID: user.getId() ?? '',
    };

    const token = await this.tokService.generateToken(tokenPayload);

    return { token, user: user.getProfile() };
  }
}
