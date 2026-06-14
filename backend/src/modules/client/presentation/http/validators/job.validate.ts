import { RequestHandler } from 'express';
import { JobType } from '../../../domain/job';

export const createJobValidate: RequestHandler = (req, res, next) => {
  const { title, requirements, type } = req.body as { title?: string; requirements?: unknown; type?: unknown };

  if (!title || !title.trim()) {
    res.status(400).json({ success: false, message: 'Vui lòng nhập tiêu đề công việc!' });
    return;
  }

  // requirements là array string từ frontend; nếu có thì phải là array
  if (requirements !== undefined && !Array.isArray(requirements)) {
    res.status(400).json({ success: false, message: 'Yêu cầu công việc không hợp lệ!' });
    return;
  }

  if (!type || (type !== JobType.FULLTIME && type !== JobType.FREELANCE)) {
    res.status(400).json({ success: false, message: 'Vui lòng chọn loại công việc hợp lệ (FULLTIME hoặc FREELANCE)!' });
    return;
  }

  next();
};
