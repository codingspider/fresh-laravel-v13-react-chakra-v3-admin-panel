import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Pages for guests only (inside AuthLayout)
export const authGuestRoutes = [
    { path: '/login', element: <LoginPage /> },
    { path: '/forgot-password', element: <ForgotPasswordPage /> },
    { path: '/reset-password', element: <ResetPasswordPage /> },
];

// Pages for logged-in users (inside AppLayout)
export const authPrivateRoutes = [{ path: '/profile', element: <ProfilePage /> }];
