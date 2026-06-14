
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

  getCurrentState() {
    return this.#currentState;
  }

  canAdvance() {
    return this.#currentState.canGoNext();
  }

  canGoBack() {
    return this.#currentState.canGoPrevious();
  }

  transition(targetStateId) {
    const targetState = getStateById(targetStateId);

    if (!targetState) {
      return { success: false, error: `Trạng thái "${targetStateId}" không hợp lệ.` };
    }

    if (targetState.id === this.#currentState.id) {
      return { success: false, error: 'Trạng thái không thay đổi.' };
    }

    const isNext = this.#currentState.getNext()?.id === targetState.id;
    const isPrev = this.#currentState.getPrevious()?.id === targetState.id;

    if (!isNext && !isPrev) {
      return { success: false, error: 'Quy trình không hợp lệ!' };
    }

    this.#currentState = targetState;
    return { success: true, state: targetState };
  }

  advance() {
    const next = this.#currentState.getNext();
    if (!next) {
      return { success: false, error: 'Đây là bước cuối cùng trong quy trình.' };
    }
    this.#currentState = next;
    return { success: true, state: next };
  }

  goBack() {
    const prev = this.#currentState.getPrevious();
    if (!prev) {
      return { success: false, error: 'Đây là bước đầu tiên trong quy trình.' };
    }
    this.#currentState = prev;
    return { success: true, state: prev };
  }
}
