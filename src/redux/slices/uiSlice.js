import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    notifications: {
      show: false,
      message: "",
      type: "info",
    },
  },
  reducers: {
    showNotification: (state, action) => {
      const { message, type = "info" } = action.payload;

      state.notifications = {
        show: true,
        message,
        type,
      };

      switch (type) {
        case "success":
          toast.success(message);
          break;
        case "error":
          toast.error(message);
          break;
        case "warning":
          toast.warning(message);
          break;
        case "info":
        default:
          toast.info(message);
          break;
      }
    },
    hideNotification: (state) => {
      state.notifications.show = false;
    },
  },
});

export const { showNotification, hideNotification } = uiSlice.actions;

export default uiSlice.reducer;
