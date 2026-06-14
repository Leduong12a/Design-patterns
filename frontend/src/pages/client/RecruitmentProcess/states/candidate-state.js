
class AppliedState {
  get id()         { return 'applied'; }
  get label()      { return 'Ứng tuyển'; }
  get colorClass() { return 'kanban-column--applied'; }
  get cardClass()  { return 'candidate-card--applied'; }

  getNext()     { return getStateById('screening'); }
  getPrevious() { return null; } 

  canGoNext()   { return true; }
  canGoPrevious() { return false; }
}

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

class OfferState {
  get id()         { return 'offer'; }
  get label()      { return 'Đề nghị'; }
  get colorClass() { return 'kanban-column--offer'; }
  get cardClass()  { return 'candidate-card--offer'; }

  getNext()     { return null; } 
  getPrevious() { return getStateById('interview'); }

  canGoNext()     { return false; }
  canGoPrevious() { return true; }
}

const STATE_INSTANCES = {
  applied:   new AppliedState(),
  screening: new ScreeningState(),
  interview: new InterviewState(),
  offer:     new OfferState(),
};

export function getStateById(id) {
  return STATE_INSTANCES[id] ?? null;
}

export const ALL_STATES = [
  STATE_INSTANCES.applied,
  STATE_INSTANCES.screening,
  STATE_INSTANCES.interview,
  STATE_INSTANCES.offer,
];
