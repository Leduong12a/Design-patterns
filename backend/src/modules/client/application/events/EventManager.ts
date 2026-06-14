export interface EventListener {
  update(payload: any): Promise<void>;
}

export class EventManager {
  private static instance: EventManager;
  private readonly listeners = new Map<string, EventListener[]>();

  private constructor() {}

  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  subscribe(eventName: string, listener: EventListener): void {
    const eventListeners = this.listeners.get(eventName) ?? [];
    console.log("lắng nghe sự kiện nghe");
    console.log(eventListeners);
    eventListeners.push(listener);
    this.listeners.set(eventName, eventListeners);
  }

  unsubscribe(eventName: string, listener: EventListener): void {
    const eventListeners = this.listeners.get(eventName) ?? [];
    this.listeners.set(
      eventName,
      eventListeners.filter((current) => current !== listener),
    );
  }

  async notify(eventName: string, payload: any): Promise<void> {
    const eventListeners = this.listeners.get(eventName) ?? [];

    for (const listener of eventListeners) {
      await listener.update(payload);
    }
  }
}
