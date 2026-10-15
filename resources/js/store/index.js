import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/modules/auth/store/authSlice';

/*
 * The Redux store. Register every module's slice here.
 * Read state in a component with: useSelector((state) => state.auth.user)
 */
export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
});
