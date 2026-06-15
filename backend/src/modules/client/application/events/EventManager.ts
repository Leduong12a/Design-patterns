export interface EventListener {
  update(payload: any): Promise<void>;
}

export class EventManager {
  private static instance: EventManager;
  private readonly listeners = new Map<string, EventListener[]>();

  private constructor() { }

  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  subscribe(eventName: string, listener: EventListener): void {
    const eventListeners = this.listeners.get(eventName) ?? [];
    if (!eventListeners.includes(listener)) {
      eventListeners.push(listener);
      this.listeners.set(eventName, eventListeners);
      console.log(`[EventManager] Đăng ký listener: ${listener.constructor.name} lắng nghe sự kiện "${eventName}"`);
    }
  }

  unsubscribe(eventName: string, listener: EventListener): void {
    const eventListeners = this.listeners.get(eventName) ?? [];
    this.listeners.set(
      eventName,
      eventListeners.filter((current) => current !== listener),
    );
  }

  async notify(eventName: string, payload: any): Promise<void> {
    console.log(`[EventManager] Kích hoạt sự kiện "${eventName}" với dữ liệu:`, {
      userId: payload.userId,
      candidateID: payload.candidateID,
      jobID: payload.jobID,
      time: payload.time,
      address: payload.address,
    });

    const eventListeners = this.listeners.get(eventName) ?? [];

    for (const listener of eventListeners) {
      await listener.update(payload);
    }
  }
}
