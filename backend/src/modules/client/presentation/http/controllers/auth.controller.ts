import { Request, Response } from 'express';
import { LoginUseCase } from '../../../application/use-cases/auth/login.use-case';
import { LogoutUseCase } from '../../../application/use-cases/auth/logut.use-case';
import { AuthRepository } from '../../../infrastructure/database/repositories/auth.repository';
import { OtpRepository } from '../../../infrastructure/database/repositories/otp.repository';
import { PasswordService } from '../../../infrastructure/external-service/password.service';
import { TokenService } from '../../../infrastructure/external-service/token.service';
import { MailService } from '../../../infrastructure/external-service/mail.service';
import { asyncHandler } from '../../../../../shared/utils/asyncHandler';
import { randomNumber } from '../../../../../shared/utils/randomNumber.util';
import { htmlEmailOtp } from '../../../../../shared/templates/email/otp';
import { OTPEntity } from '../../../domain/otp/otp.entity';

const authRepository = new AuthRepository();
const otpRepository = new OtpRepository();
const passwordService = new PasswordService();
const tokenService = new TokenService();
const mailService = new MailService();

const loginUseCase = new LoginUseCase(authRepository, passwordService, tokenService, otpRepository);
const logoutUseCase = new LogoutUseCase();

// [POST] /auth/login
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, strategy, ...payload } = req.body as { email: string; strategy?: string; [key: string]: any };
  
  const activeStrategy = strategy || 'email';
  const { token, user } = await loginUseCase.execute(email, payload, activeStrategy);

  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  res.json({ success: true, code: 200, message: 'Đăng nhập thành công!', token, user });
});

// [POST] /auth/send-otp
export const sendOtp = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email: string };
  if (!email) {
    res.status(400).json({ code: 400, message: 'Vui lòng cung cấp Email!' });
    return;
  }

  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    res.status(404).json({ code: 404, message: 'Email không tồn tại trong hệ thống!' });
    return;
  }

  if (!user.isActive()) {
    res.status(403).json({ code: 403, message: 'Tài khoản đã bị khóa!' });
    return;
  }

  const recentOtp = await otpRepository.findRecentOTP(email);
  if (recentOtp) {
    const secondsPassed = (Date.now() - new Date(recentOtp.getCreatedAt()!).getTime()) / 1000;
    if (secondsPassed < 60) {
      res.status(429).json({
        code: 429,
        message: `Vui lòng đợi ${Math.ceil(60 - secondsPassed)} giây trước khi gửi mã mới!`
      });
      return;
    }
  }

  const otpCode = randomNumber(6);
  const otpEntity = OTPEntity.create({ email, otp: otpCode, expiresInMinutes: 5 });
  const savedOtp = await otpRepository.create(otpEntity);

  if (!savedOtp) {
    res.status(500).json({ code: 500, message: 'Không thể tạo mã OTP!' });
    return;
  }

  const subject = 'Mã OTP Đăng nhập HR-Agent';
  const content = htmlEmailOtp(savedOtp.getOtp());
  
  try {
    await mailService.sendEmail(email, subject, content);
  } catch (err) {
    console.error('Lỗi gửi email:', err);
  }

  // Trả về OTP trong response để hỗ trợ việc test/mô phỏng trên giao diện thuận tiện
  res.status(200).json({
    success: true,
    code: 200,
    message: 'Mã OTP đăng nhập đã được gửi đến email của bạn!',
    otp: otpCode,
  });
});

// [POST] /auth/logout
export const logout = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const userID: string = res.locals.user.id.toString();

  logoutUseCase.execute(userID);

  res.clearCookie('token');

  res.json({ code: 200, message: 'Đăng xuất thành công!' });
});
