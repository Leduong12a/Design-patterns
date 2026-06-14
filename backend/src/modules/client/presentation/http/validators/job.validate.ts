import { RequestHandler } from 'express';

export const createJobValidate: RequestHandler = (req, res, next) => {
  const { title, requirements } = req.body as { title?: string; requirements?: unknown };

  if (!title || !title.trim()) {
    res.status(400).json({ success: false, message: 'Vui lòng nhập tiêu đề công việc!' });
    return;
  }

  if (requirements !== undefined && !Array.isArray(requirements)) {
    res.status(400).json({ success: false, message: 'Yêu cầu công việc không hợp lệ!' });
    return;
  }

  next();
};
