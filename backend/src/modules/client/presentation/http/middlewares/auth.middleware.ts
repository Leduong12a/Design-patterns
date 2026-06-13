import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../../../infrastructure/database/repositories/user.repository';
import { TokenService } from '../../../infrastructure/external-service/token.service';
import { asyncHandler } from '../../../../../shared/utils/asyncHandler';
import { UnauthorizedError } from '../../../../../shared/utils/errors';


const userRepository = new UserRepository();
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
  const user = await userRepository.findUserByID(decoded.userID);

  if (!user) {
    throw new UnauthorizedError('Tài khoản không hợp lệ hoặc đã bị khóa.');
  }

  res.locals.user = user;
  next();
});

