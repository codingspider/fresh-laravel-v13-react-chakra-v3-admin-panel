import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Loader from '@/components/common/Loader';
import NotFound from '@/components/common/NotFound';
import { useColorMode } from '@/components/ui/color-mode';
import AppLayout from '@/layouts/AppLayout';
import AuthLayout from '@/layouts/AuthLayout';
import { authGuestRoutes, authPrivateRoutes } from '@/modules/auth/routes';
import { fetchMe } from '@/modules/auth/store/authSlice';
import DashboardPage from '@/modules/dashboard/pages/DashboardPage';
import GuestRoute from '@/routes/GuestRoute';
import ProtectedRoute from '@/routes/ProtectedRoute';

// Add each new module's routes to these lists
const guestRoutes = [...authGuestRoutes];
const privateRoutes = [{ path: '/dashboard', element: <DashboardPage /> }, ...authPrivateRoutes];

export default function App() {
    const dispatch = useDispatch();
    const checked = useSelector((state) => state.auth.checked);
    const { colorMode } = useColorMode();

    // When the app opens, ask the server who is logged in (cookie is sent automatically)
    useEffect(() => {
        dispatch(fetchMe());
    }, [dispatch]);

    // Wait for the answer before showing any page
    if (!checked) {
        return <Loader />;
    }

    return (
        <>
            <Routes>
                {/* Guests only: login, forgot / reset password */}
                <Route element={<GuestRoute />}>
                    <Route element={<AuthLayout />}>
                        {guestRoutes.map((route) => (
                            <Route key={route.path} path={route.path} element={route.element} />
                        ))}
                    </Route>
                </Route>

                {/* Logged-in users only */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        {privateRoutes.map((route) => (
                            <Route key={route.path} path={route.path} element={route.element} />
                        ))}
                    </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>

            <ToastContainer position="top-right" autoClose={3000} theme={colorMode} />
        </>
    );
}
