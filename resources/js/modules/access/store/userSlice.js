import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getErrorMessage } from '@/utils/errors';
import userApi from '../api/userApi';

// Load one page of users (params come from the URL)
export const fetchUsers = createAsyncThunk('users/fetchAll', async (params, { rejectWithValue }) => {
    try {
        const response = await userApi.getAll(params);
        return response.data; // { success, message, data, errors, meta }
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

const userSlice = createSlice({
    name: 'users',
    initialState: {
        items: [],
        meta: null, // pagination info from the API
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.meta = action.payload.meta;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default userSlice.reducer;
