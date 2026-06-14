import { RequestHandler } from 'express';

export const loginValidate: RequestHandler = (req, res, next) => {
  const { email, strategy } = req.body as { email?: string; strategy?: string };
  const activeStrategy = strategy || 'email';

  if (!email) {
    res.status(400).json({ code: 400, message: 'Vui lòng nhập Email!' });
    return;
  }

  if (activeStrategy === 'email') {
    const { password } = req.body as { password?: string };
    if (!password) {
      res.status(400).json({ code: 400, message: 'Vui lòng nhập mật khẩu!' });
      return;
    }
  } else if (activeStrategy === 'otp') {
    const { otp } = req.body as { otp?: string };
    if (!otp) {
      res.status(400).json({ code: 400, message: 'Vui lòng nhập mã OTP!' });
      return;
    }
  } else if (activeStrategy === 'oauth') {
    const { provider, token } = req.body as { provider?: string; token?: string };
    if (!provider) {
      res.status(400).json({ code: 400, message: 'Thiếu thông tin nhà cung cấp OAuth!' });
      return;
    }
    if (!token) {
      res.status(400).json({ code: 400, message: 'Thiếu mã xác thực OAuth!' });
      return;
    }
  } else if (activeStrategy === 'passkey') {
    const { credentialId } = req.body as { credentialId?: string };
    if (!credentialId) {
      res.status(400).json({ code: 400, message: 'Thiếu thông tin định danh Passkey!' });
      return;
    }
  }

  next();
};

export const signupValidate: RequestHandler = (req, res, next) => {
  const { fullName, email, password, confirmPassword } = req.body as { fullName?: string; email?: string; password?: string; confirmPassword?: string };

  if (!fullName || !fullName.trim()) {
    res.status(400).json({ code: 400, message: 'Vui lòng nhập họ tên!' });
    return;
  }

  if (!email) {
    res.status(400).json({ code: 400, message: 'Vui lòng nhập Email!' });
    return;
  }

  if (!password) {
    res.status(400).json({ code: 400, message: 'Vui lòng nhập mật khẩu!' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ code: 400, message: 'Mật khẩu phải có ít nhất 6 ký tự!' });
    return;
  }

  if (!confirmPassword) {
    res.status(400).json({ code: 400, message: 'Vui lòng xác nhận mật khẩu!' });
    return;
  }

  next();
};
