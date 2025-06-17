import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    notifications: {
      show: false,
      message: '',
      type: 'info'
    }
  },
  reducers: {
    showNotification: (state, action) => {
      state.notifications = {
        show: true,
        message: action.payload.message,
        type: action.payload.type || 'info'
      };
    },
    hideNotification: (state) => {
      state.notifications.show = false;
    }
  }
});

export const { showNotification, hideNotification } = uiSlice.actions;

export default uiSlice.reducer;