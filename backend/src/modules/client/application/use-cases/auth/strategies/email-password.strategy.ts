import type { IAuth } from '../../../ports/repositories/auth.interface';
import type { IPasswordService } from '../../../ports/services/password.service';
import type { ITokenService, ITokenPayload } from '../../../ports/services/token.service';
import type { IAuthStrategy, ILoginResult } from './auth-strategy.interface';

export class EmailPasswordStrategy implements IAuthStrategy {
  constructor(
    private readonly authRepo: IAuth,
    private readonly passService: IPasswordService,
    private readonly tokService: ITokenService,
  ) {}

  async authenticate(payload: any): Promise<ILoginResult> {
    const { email, password } = payload;
    if (!email || !password) {
      throw new Error('Thiếu Email hoặc Mật khẩu!');
    }

    const user = await this.authRepo.findUserByEmail(email);
    if (!user) {
      throw new Error('Email không tồn tại!');
    }

    if (!user.isActive()) {
      throw new Error('Tài khoản đã bị khóa! Vui lòng liên hệ Admin.');
    }

    const passwordMatch = await user.verifyPassword(password, this.passService);
    if (!passwordMatch) {
      throw new Error('Mật khẩu không chính xác!');
    }

    const tokenPayload: ITokenPayload = {
      userID: user.getId() ?? '',
    };

    const token = await this.tokService.generateToken(tokenPayload);

    return { token, user: user.getProfile() };
  }
}
