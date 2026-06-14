import type { IAuth } from '../../../ports/repositories/auth.interface';
import type { IOTPReadRepo, IOTPWriteRepo } from '../../../ports/repositories/otp.interface';
import type { IPasswordService } from '../../../ports/services/password.service';
import type { ITokenService } from '../../../ports/services/token.service';
import type { IAuthStrategy } from './auth-strategy.interface';
import { EmailPasswordStrategy } from './email-password.strategy';
import { OtpStrategy } from './otp.strategy';
import { OAuthStrategy } from './oauth.strategy';
import { PasskeyStrategy } from './passkey.strategy';
import { SecurityAuthProxy } from './security-auth.proxy';

export interface IStrategyDependencies {
  authRepo: IAuth;
  otpRepo?: IOTPReadRepo & IOTPWriteRepo;
  passService: IPasswordService;
  tokService: ITokenService;
}

export class AuthStrategyFactory {
  static create(type: string, dependencies: IStrategyDependencies): IAuthStrategy {
    let baseStrategy: IAuthStrategy;

    switch (type.toLowerCase()) {
      case 'email':
      case 'local':
        baseStrategy = new EmailPasswordStrategy(
          dependencies.authRepo,
          dependencies.passService,
          dependencies.tokService
        );
        break;
      case 'otp':
        if (!dependencies.otpRepo) {
          throw new Error('OtpRepository is required for OTP authentication strategy!');
        }
        baseStrategy = new OtpStrategy(
          dependencies.authRepo,
          dependencies.otpRepo,
          dependencies.tokService
        );
        break;
      case 'oauth':
        baseStrategy = new OAuthStrategy(
          dependencies.authRepo,
          dependencies.tokService
        );
        break;
      case 'passkey':
        baseStrategy = new PasskeyStrategy(
          dependencies.authRepo,
          dependencies.tokService
        );
        break;
      default:
        throw new Error(`Strategy loại "${type}" không được hỗ trợ!`);
    }

    // Proxy Design Pattern: Bọc baseStrategy bằng SecurityAuthProxy
    return new SecurityAuthProxy(baseStrategy, type);
  }
}
