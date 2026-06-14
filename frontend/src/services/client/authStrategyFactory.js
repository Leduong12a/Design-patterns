import {
  EmailPasswordStrategy,
  OTPStrategy,
  OAuthStrategy,
  PasskeyStrategy,
} from "./authStrategies";

class AuthStrategyFactory {
  static create(type) {
    switch (type.toLowerCase()) {
      case "email":
      case "local":
        return new EmailPasswordStrategy();
      case "otp":
        return new OTPStrategy();
      case "oauth":
        return new OAuthStrategy();
      case "passkey":
        return new PasskeyStrategy();
      default:
        throw new Error(`Chiến lược "${type}" không được hỗ trợ bởi Factory!`);
    }
  }
}

export default AuthStrategyFactory;
