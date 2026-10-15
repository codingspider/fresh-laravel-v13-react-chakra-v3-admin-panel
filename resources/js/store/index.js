import { configureStore } from '@reduxjs/toolkit';
import roleReducer from '@/modules/access/store/roleSlice';
import userReducer from '@/modules/access/store/userSlice';
import authReducer from '@/modules/auth/store/authSlice';

/*
 * The Redux store. Register every module's slice here.
 * Read state in a component with: useSelector((state) => state.auth.user)
 */
export const store = configureStore({
    reducer: {
        auth: authReducer,
        users: userReducer,
        roles: roleReducer,
    },
});
