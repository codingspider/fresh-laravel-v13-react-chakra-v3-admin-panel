import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import authApi from '../api/authApi';

// Ask the server who is logged in (the session cookie is sent automatically).
// Guests get 401 — that is not an error, it just means "nobody is logged in".
export const fetchMe = createAsyncThunk('auth/fetchMe', async () => {
    try {
        const response = await authApi.me();
        return response.data.data; // the user
    } catch {
        return null;
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null, // { id, name, email, phone, roles: [], permissions: [] }
        checked: false, // true after we asked the server once (app start)
    },
    reducers: {
        // After login or profile update
        setUser: (state, action) => {
            state.user = action.payload;
        },
        // After logout
        clearUser: (state) => {
            state.user = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchMe.fulfilled, (state, action) => {
            state.user = action.payload;
            state.checked = true;
        });
    },
});

export const { setUser, clearUser } = authSlice.actions;

export default authSlice.reducer;
