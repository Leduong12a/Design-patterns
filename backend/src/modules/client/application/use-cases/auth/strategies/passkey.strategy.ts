import type { IAuth } from '../../../ports/repositories/auth.interface';
import type { ITokenService, ITokenPayload } from '../../../ports/services/token.service';
import type { IAuthStrategy, ILoginResult } from './auth-strategy.interface';

export class PasskeyStrategy implements IAuthStrategy {
  constructor(
    private readonly authRepo: IAuth,
    private readonly tokService: ITokenService,
  ) {}

  async authenticate(payload: any): Promise<ILoginResult> {
    const { email, credentialId } = payload;
    if (!email || !credentialId) {
      throw new Error('Thiếu thông tin Email hoặc định danh Passkey!');
    }

    const user = await this.authRepo.findUserByEmail(email);
    if (!user) {
      throw new Error(`Email "${email}" chưa được đăng ký trong hệ thống!`);
    }

    if (!user.isActive()) {
      throw new Error('Tài khoản đã bị khóa! Vui lòng liên hệ Admin.');
    }

    const tokenPayload: ITokenPayload = {
      userID: user.getId() ?? '',
    };

    const token = await this.tokService.generateToken(tokenPayload);

    return { token, user: user.getProfile() };
  }
}
