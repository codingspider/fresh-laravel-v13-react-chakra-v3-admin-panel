import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getErrorMessage } from '@/utils/errors';
import roleApi from '../api/roleApi';

// Load one page of roles (params come from the URL)
export const fetchRoles = createAsyncThunk('roles/fetchAll', async (params, { rejectWithValue }) => {
    try {
        const response = await roleApi.getAll(params);
        return response.data; // { success, message, data, errors, meta }
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

const roleSlice = createSlice({
    name: 'roles',
    initialState: {
        items: [],
        meta: null, // pagination info from the API
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRoles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRoles.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.meta = action.payload.meta;
            })
            .addCase(fetchRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default roleSlice.reducer;
