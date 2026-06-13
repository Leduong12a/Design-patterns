import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../../../../client/infrastructure/external-service/token.service';
import { AuthRepository } from '../../../infrastructure/repositories/auth.repository';
import { asyncHandler } from '../../../../../shared/utils/asyncHandler';
import { UnauthorizedError } from '../../../../../shared/utils/errors';

const authRepository = new AuthRepository();
const tokenService = new TokenService();

export const authMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token = req.cookies?.token as string | undefined;

  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new UnauthorizedError('Vui lòng đăng nhập lại.');
  }

  const decoded = await tokenService.verifyToken(token);
  const admin = await authRepository.findAccountByID(decoded.userID);

  if (!admin) {
    throw new UnauthorizedError('Tài khoản không hợp lệ hoặc đã bị khóa.');
  }

  res.locals.admin = admin;
  next();
});

