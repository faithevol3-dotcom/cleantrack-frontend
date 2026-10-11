import api from "./api";

export const scheduleService = {
  create: (data) => api.post("/schedules", data),
  getMine: () => api.get("/schedules/my-schedules"),
  setStatus: (id, status) => api.put("/schedules/" + id + "/status", { status }),
  remove: (id) => api.delete("/schedules/" + id)
};
