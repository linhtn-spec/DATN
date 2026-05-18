import api from "../request/api";

export const notificationService = {
  getNotifications: async (userId) => {
    // Pass userId if available
    const url = userId ? `/notifications?userId=${userId}` : "/notifications";
    return api.get(url);
  },
  
  markAsRead: async (id) => {
    return api.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (userId) => {
    const url = userId ? `/notifications/read-all?userId=${userId}` : "/notifications/read-all";
    return api.put(url);
  },

  deleteNotification: async (id) => {
    return api.delete(`/notifications/${id}`);
  }
};
