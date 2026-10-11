import api from "./api";

export const summaryService = {
  getMyPickups: () => api.get("/summary/my-pickups")
};
