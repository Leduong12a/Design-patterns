import { Request, Response } from 'express';
import { LoginUseCase } from '../../../application/use-cases/auth/login.use-case';
import { LogoutUseCase } from '../../../application/use-cases/auth/logut.use-case';
import { AuthRepository } from '../../../infrastructure/database/repositories/auth.repository';
import { PasswordService } from '../../../infrastructure/external-service/password.service';
import { TokenService } from '../../../infrastructure/external-service/token.service';
import { asyncHandler } from '../../../../../shared/utils/asyncHandler';

const authRepository = new AuthRepository();
const passwordService = new PasswordService();
const tokenService = new TokenService();
const loginUseCase = new LoginUseCase(authRepository, passwordService, tokenService);
const logoutUseCase = new LogoutUseCase();

// [POST] /auth/login
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };
  const { token, user } = await loginUseCase.execute(email, password);

  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  res.json({ success: true, code: 200, message: 'Đăng nhập thành công!', token, user });
});

// [POST] /auth/logout
export const logout = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const userID: string = res.locals.user.id.toString();

  logoutUseCase.execute(userID);

  res.clearCookie('token');

  res.json({ code: 200, message: 'Đăng xuất thành công!' });
});


