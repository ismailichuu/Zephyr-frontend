import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserState = {
  name: string | null,
  email: string | null,
  _id: string | null,
  role: 'client' | 'freelancer' | 'admin' | null,
  isAuthenticated: boolean,
};

const initialState: UserState = {
  name: null,
  email: null,
  _id: null,
  role: null,
  isAuthenticated: false, 
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Omit<UserState, 'isAuthenticated'>>) {
      return {
        ...action.payload,
        isAuthenticated: true,
      }
    },

    clearUser() {
      return initialState;
    }
  }
})

export const {setUser, clearUser} = userSlice.actions;
export default  userSlice.reducer;