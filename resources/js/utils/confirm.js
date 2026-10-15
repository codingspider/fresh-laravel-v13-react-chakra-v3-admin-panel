import Swal from 'sweetalert2';
import { brandColors } from '@/theme/theme';

// Ask before delete / approve / reject / any action that cannot be undone.
// const confirmed = await confirmAction({ text: 'Delete this employee?' });
export async function confirmAction({
    title = 'Are you sure?',
    text = 'This action cannot be undone.',
    confirmText = 'Yes, continue',
} = {}) {
    const isDark = document.documentElement.classList.contains('dark');

    const result = await Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancel',
        confirmButtonColor: brandColors.danger,
        reverseButtons: true,
        background: isDark ? brandColors.darkCard : '#ffffff',
        color: isDark ? '#f4f4f5' : '#18181b',
    });

    return result.isConfirmed;
}
