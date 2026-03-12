import { createSlice,type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  user: { id: string; email: string } | null;
  isAuthenticated: boolean;
}

// Перевіряємо, чи є токен у localStorage при завантаженні сторінки
const initialToken = localStorage.getItem('token');
const initialUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null;

const initialState: AuthState = {
  token: initialToken,
  user: initialUser,
  isAuthenticated: !!initialToken,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: { id: string; email: string } }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;