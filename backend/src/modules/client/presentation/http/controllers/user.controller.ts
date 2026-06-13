import { Request, Response } from 'express';
import { ForgotPasswordUseCase } from '../../../application/use-cases/user/forgot-password.use-case';
import { VerifyOtpUseCase } from '../../../application/use-cases/user/verify-otp.use-case';
import { ResetPasswordUseCase } from '../../../application/use-cases/user/reset-password.use-case';
import { ResetPassNotOTPUseCase } from '../../../application/use-cases/user/reset-pass-not-otp.use-case';
import { UserRepository } from '../../../infrastructure/database/repositories/user.repository';
import { OtpRepository } from '../../../infrastructure/database/repositories/otp.repository';
import { MailService } from '../../../infrastructure/external-service/mail.service';
import { PasswordService } from '../../../infrastructure/external-service/password.service';
import { asyncHandler } from '../../../../../shared/utils/asyncHandler';

const userRepository = new UserRepository();
const otpRepository = new OtpRepository();

const emailService = new MailService();
const passwordService = new PasswordService();

const forgotPasswordUseCase = new ForgotPasswordUseCase(userRepository, otpRepository, emailService);
const verifyOtpUseCase = new VerifyOtpUseCase(userRepository, otpRepository);
const resetPasswordUseCase = new ResetPasswordUseCase(userRepository, otpRepository, passwordService);
const ressetPassNotOTPUseCase = new ResetPassNotOTPUseCase(userRepository, passwordService);

// [POST] /user/password/forgot
export const forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email: string };

  const result = await forgotPasswordUseCase.execute(email);

  res.status(200).json({ success: true, message: 'Mã OTP đã được gửi đến email của bạn!', email: result.email });
});

// [POST] /user/password/otp
export const verifyOTP = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body as { email: string; otp: string };

  await verifyOtpUseCase.execute(email, otp);

  res.status(200).json({ success: true, message: 'Xác thực OTP thành công!' });
});

// [POST] /user/password/reset
export const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password, confirmPassword } = req.body as {
    email: string;
    password: string;
    confirmPassword: string;
  };

  await resetPasswordUseCase.execute(email, password, confirmPassword);

  res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' });
});

// [POST] /user/password/reset-not-otp
export const resetNotOTP = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password, confirmPassword } = req.body as {
    email: string;
    password: string;
    confirmPassword: string;
  };
  await ressetPassNotOTPUseCase.execute(email, password, confirmPassword);

  res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' });
});