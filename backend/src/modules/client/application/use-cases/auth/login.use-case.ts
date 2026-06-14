import type { IAuth } from '../../ports/repositories/auth.interface';
import type { IOTPReadRepo, IOTPWriteRepo } from '../../ports/repositories/otp.interface';
import type { IPasswordService } from '../../ports/services/password.service';
import type { ITokenService } from '../../ports/services/token.service';
import type { IUserProfile } from '../../../domain/user';
import { AuthStrategyFactory } from './strategies/auth-strategy.factory';

export interface ILoginResult {
  token: string;
  user: IUserProfile;
}

export class LoginUseCase {
  constructor(
    private readonly authRepo: IAuth,
    private readonly passService: IPasswordService,
    private readonly tokService: ITokenService,
    private readonly otpRepo?: IOTPReadRepo & IOTPWriteRepo,
  ) { }

  async execute(email: string, payload: any, strategy: string = 'email'): Promise<ILoginResult> {
    const strategyInstance = AuthStrategyFactory.create(strategy, {
      authRepo: this.authRepo,
      passService: this.passService,
      tokService: this.tokService,
      otpRepo: this.otpRepo,
    });

    return strategyInstance.authenticate({ email, ...payload });
  }
}
