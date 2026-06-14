import API from "./index";

const emailService = {
  
  sendBulkEmail: async (data) => {
    
    try {
      const res = await API.post("/email/send-bulk", data);
      return res;
    } catch (error) {
      console.error("Error sending bulk email:", error);
      throw error;
    }
  },
};

export default emailService;
