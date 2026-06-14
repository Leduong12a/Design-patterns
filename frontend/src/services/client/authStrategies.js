import API from "./index";

export class AuthStrategy {
  async authenticate(credentials) {
    throw new Error("Phương thức authenticate() phải được cài đặt ở lớp con!");
  }
}

export class EmailPasswordStrategy extends AuthStrategy {
  async authenticate(credentials) {
    const { email, password } = credentials;
    return await API.post("/auth/login", {
      email,
      password,
      strategy: "email",
    });
  }
}

export class OTPStrategy extends AuthStrategy {
  async authenticate(credentials) {
    const { email, otp } = credentials;
    return await API.post("/auth/login", {
      email,
      otp,
      strategy: "otp",
    });
  }

  async sendOtp(email) {
    return await API.post("/auth/send-otp", { email });
  }
}

export class OAuthStrategy extends AuthStrategy {
  async authenticate(credentials) {
    const { provider, email, token } = credentials;
    return await API.post("/auth/login", {
      provider,
      email,
      token,
      strategy: "oauth",
    });
  }
}

export class PasskeyStrategy extends AuthStrategy {
  async authenticate(credentials) {
    const { email, credentialId } = credentials;
    return await API.post("/auth/login", {
      email,
      credentialId,
      strategy: "passkey",
    });
  }
}
