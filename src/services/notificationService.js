import api from "./api";

export const notificationService = {
  getMine: () => api.get("/notifications"),
  markRead: (id) => api.put("/notifications/" + id + "/read"),
  markAllRead: () => api.put("/notifications/read-all")
};
