// ============================================================
// State Design Pattern — Candidate States
// ============================================================
// Mỗi trạng thái ứng viên là một object riêng biệt.
// Mỗi State tự biết: label, màu, có thể tiến/lùi về đâu.
// → Không cần if/else bên ngoài để kiểm tra trạng thái.
// ============================================================

// ─── Concrete State 1: Ứng tuyển ────────────────────────────
class AppliedState {
  get id()         { return 'applied'; }
  get label()      { return 'Ứng tuyển'; }
  get colorClass() { return 'kanban-column--applied'; }
  get cardClass()  { return 'candidate-card--applied'; }

  getNext()     { return getStateById('screening'); }
  getPrevious() { return null; } // Đầu chuỗi — không lùi được

  canGoNext()   { return true; }
  canGoPrevious() { return false; }
}

// ─── Concrete State 2: Sàng lọc ────────────────────────────
class ScreeningState {
  get id()         { return 'screening'; }
  get label()      { return 'Sàng lọc'; }
  get colorClass() { return 'kanban-column--screening'; }
  get cardClass()  { return 'candidate-card--screening'; }

  getNext()     { return getStateById('interview'); }
  getPrevious() { return getStateById('applied'); }

  canGoNext()     { return true; }
  canGoPrevious() { return true; }
}

// ─── Concrete State 3: Phỏng vấn ───────────────────────────
class InterviewState {
  get id()         { return 'interview'; }
  get label()      { return 'Phỏng vấn'; }
  get colorClass() { return 'kanban-column--interview'; }
  get cardClass()  { return 'candidate-card--interview'; }

  getNext()     { return getStateById('offer'); }
  getPrevious() { return getStateById('screening'); }

  canGoNext()     { return true; }
  canGoPrevious() { return true; }
}

// ─── Concrete State 4: Đề nghị (Offer) ─────────────────────
class OfferState {
  get id()         { return 'offer'; }
  get label()      { return 'Đề nghị'; }
  get colorClass() { return 'kanban-column--offer'; }
  get cardClass()  { return 'candidate-card--offer'; }

  getNext()     { return null; } // Cuối chuỗi — không tiến được
  getPrevious() { return getStateById('interview'); }

  canGoNext()     { return false; }
  canGoPrevious() { return true; }
}

// ─── Singleton instances (lazy) ─────────────────────────────
// Các State không có dữ liệu riêng → dùng chung một instance
const STATE_INSTANCES = {
  applied:   new AppliedState(),
  screening: new ScreeningState(),
  interview: new InterviewState(),
  offer:     new OfferState(),
};

// ─── Factory: tạo State từ string id ─────────────────────────
// Trả về null nếu id không hợp lệ thay vì throw — an toàn hơn
export function getStateById(id) {
  return STATE_INSTANCES[id] ?? null;
}

// Danh sách tất cả State theo thứ tự (dùng cho Column render)
export const ALL_STATES = [
  STATE_INSTANCES.applied,
  STATE_INSTANCES.screening,
  STATE_INSTANCES.interview,
  STATE_INSTANCES.offer,
];
