export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Yêu cầu không hợp lệ.') {
    super(400, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Vui lòng đăng nhập lại.') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Bạn không có quyền thực hiện hành động này.') {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Không tìm thấy tài nguyên yêu cầu.') {
    super(404, message);
  }
}
