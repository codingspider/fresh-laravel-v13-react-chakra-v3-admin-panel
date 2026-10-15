// Read a human message from our API response format.
// For validation errors (422) show the first field error — it is more helpful than "Validation failed."
export function getErrorMessage(error) {
    const data = error.response?.data;

    if (error.response?.status === 422 && data?.errors) {
        const firstField = Object.keys(data.errors)[0];
        return data.errors[firstField][0];
    }

    return data?.message || 'Something went wrong. Please try again.';
}

// Put Laravel 422 validation errors under the matching react-hook-form fields.
export function setServerErrors(error, setError) {
    const errors = error.response?.data?.errors;

    if (error.response?.status === 422 && errors) {
        Object.entries(errors).forEach(([field, messages]) => {
            setError(field, { type: 'server', message: messages[0] });
        });
    }
}
