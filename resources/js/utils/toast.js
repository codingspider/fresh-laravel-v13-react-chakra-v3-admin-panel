import { toast as toastify } from 'react-toastify';

// Toastr-style messages for results (saved, deleted, failed).
// <ToastContainer /> is placed once in App.jsx.
export const toast = {
    success: (message) => toastify.success(message || 'Done'),
    error: (message) => toastify.error(message || 'Something went wrong'),
    info: (message) => toastify.info(message),
    warning: (message) => toastify.warning(message),
};
