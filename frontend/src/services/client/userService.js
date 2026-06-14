import API from "./index";

const userService = {
  getInterviewNotificationSubscription: async () => {
    const res = await API.get("/user/interview-notification");
    console.log(res);
    return res;
  },

  updateInterviewNotificationSubscription: async (payload) => {
    const res = await API.patch("/user/interview-notification", payload);
    return res;
  },
};

export default userService;
