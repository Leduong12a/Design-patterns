import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../../utils/errors';

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('--- Global Error Handler ---');
  console.error(err);

  const isAuthError =
    err.name === 'JsonWebTokenError' ||
    err.name === 'TokenExpiredError' ||
    err.statusCode === 401;

  if (isAuthError) {
    res.clearCookie('token');
    res.status(401).json({
      success: false,
      message: err.message || 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.',
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  const isSystemError =
    err instanceof TypeError ||
    err instanceof ReferenceError ||
    err instanceof SyntaxError ||
    err.name === 'MongoServerError';

  const statusCode = err.statusCode || (isSystemError ? 500 : 400);
  const defaultMessage = isSystemError ? 'Đã xảy ra lỗi hệ thống!' : 'Yêu cầu không hợp lệ!';

  res.status(statusCode).json({
    success: false,
    message: err.message || defaultMessage,
  });
};


