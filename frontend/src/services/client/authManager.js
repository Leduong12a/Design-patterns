import AuthStrategyFactory from "./authStrategyFactory";
import API from "./index";

class AuthManager {
  static instance = null;

  constructor() {
    if (AuthManager.instance) {
      return AuthManager.instance;
    }
    
    this.token = localStorage.getItem("token") || null;
    this.user = JSON.parse(localStorage.getItem("user")) || null;
    this.subscribers = [];
    this.logs = [
      {
        timestamp: new Date().toLocaleTimeString(),
        pattern: "Singleton",
        message: "Khởi tạo AuthManager (Singleton) thành công.",
      }
    ];
    this.logSubscribers = [];

    AuthManager.instance = this;
  }

  static getInstance() {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // Pub-Sub for Auth State
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  notify() {
    this.subscribers.forEach(callback => callback({
      token: this.token,
      user: this.user,
      isAuthenticated: this.isAuthenticated()
    }));
  }

  // Pub-Sub for Logs
  subscribeLogs(callback) {
    this.logSubscribers.push(callback);
    return () => {
      this.logSubscribers = this.logSubscribers.filter(sub => sub !== callback);
    };
  }

  notifyLogs() {
    this.logSubscribers.forEach(callback => callback([...this.logs]));
  }

  addLog(pattern, message) {
    const newLog = {
      timestamp: new Date().toLocaleTimeString(),
      pattern,
      message
    };
    this.logs.unshift(newLog); // newer logs at the top
    if (this.logs.length > 50) this.logs.pop();
    this.notifyLogs();
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    this.addLog("Singleton", "Đã xóa tất cả nhật ký.");
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }

  isAuthenticated() {
    return !!this.token;
  }

  async login(strategyType, credentials) {
    this.addLog("Singleton", `Yêu cầu đăng nhập thông qua chiến lược: "${strategyType}"`);
    
    try {
      this.addLog("Factory", `Gọi AuthStrategyFactory.create('${strategyType}') để lấy chiến lược tương ứng.`);
      const strategy = AuthStrategyFactory.create(strategyType);
      
      this.addLog("Strategy", `Khởi chạy chiến lược "${strategy.constructor.name}".authenticate()`);
      const res = await strategy.authenticate(credentials);
      
      if (res.code === 200 || res.success) {
        this.token = res.token;
        this.user = res.user;
        
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        
        this.addLog("Singleton", `Cập nhật trạng thái đăng nhập thành công cho người dùng: ${res.user.fullName}`);
        this.notify();
        return res;
      } else {
        throw new Error(res.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || "Đã xảy ra lỗi khi xác thực";
      this.addLog("Security", `Lỗi xác thực: ${errMsg}`);
      throw error;
    }
  }

  async logout() {
    this.addLog("Singleton", "Yêu cầu đăng xuất khỏi hệ thống.");
    try {
      await API.post("/auth/logout");
    } catch (err) {
      this.addLog("Network", "Gọi API đăng xuất gặp lỗi hoặc phiên đăng nhập hết hạn.");
    } finally {
      this.token = null;
      this.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.addLog("Singleton", "Đã xóa sạch token/user cục bộ.");
      this.notify();
    }
  }
}

const authManagerInstance = AuthManager.getInstance();
export default authManagerInstance;
