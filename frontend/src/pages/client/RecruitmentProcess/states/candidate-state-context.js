// ============================================================
// State Design Pattern — CandidateStateContext
// ============================================================
// Context giữ tham chiếu tới State hiện tại và là cổng duy nhất
// để thực hiện mọi thao tác chuyển trạng thái.
// → Toàn bộ logic validate nằm ở đây, KHÔNG rải rác ở component.
// ============================================================

import { getStateById } from './candidate-state';

export class CandidateStateContext {
  #currentState;

  constructor(initialStateId) {
    const state = getStateById(initialStateId);
    if (!state) {
      throw new Error(`[CandidateStateContext] Trạng thái không hợp lệ: "${initialStateId}"`);
    }
    this.#currentState = state;
  }

  // Trả về State đang active
  getCurrentState() {
    return this.#currentState;
  }

  // Kiểm tra có thể tiến sang bước tiếp theo không
  canAdvance() {
    return this.#currentState.canGoNext();
  }

  // Kiểm tra có thể lùi về bước trước không
  canGoBack() {
    return this.#currentState.canGoPrevious();
  }

  // Chuyển trạng thái sang targetStateId
  // Trả về object mô tả kết quả — không throw để component tự xử lý UI
  transition(targetStateId) {
    const targetState = getStateById(targetStateId);

    // State id không tồn tại trong hệ thống
    if (!targetState) {
      return { success: false, error: `Trạng thái "${targetStateId}" không hợp lệ.` };
    }

    // Không thay đổi gì
    if (targetState.id === this.#currentState.id) {
      return { success: false, error: 'Trạng thái không thay đổi.' };
    }

    // Chỉ cho phép chuyển sang State liền kề (next hoặc prev)
    const isNext = this.#currentState.getNext()?.id === targetState.id;
    const isPrev = this.#currentState.getPrevious()?.id === targetState.id;

    if (!isNext && !isPrev) {
      return { success: false, error: 'Quy trình không hợp lệ!' };
    }

    // Hợp lệ — cập nhật state
    this.#currentState = targetState;
    return { success: true, state: targetState };
  }

  // Tiến 1 bước tự động (dùng khi swipe phải)
  advance() {
    const next = this.#currentState.getNext();
    if (!next) {
      return { success: false, error: 'Đây là bước cuối cùng trong quy trình.' };
    }
    this.#currentState = next;
    return { success: true, state: next };
  }

  // Lùi 1 bước tự động (dùng khi swipe trái)
  goBack() {
    const prev = this.#currentState.getPrevious();
    if (!prev) {
      return { success: false, error: 'Đây là bước đầu tiên trong quy trình.' };
    }
    this.#currentState = prev;
    return { success: true, state: prev };
  }
}
