import { IconButton } from '@chakra-ui/react';
import { useTheme } from 'next-themes';
import { LuMoon, LuSun } from 'react-icons/lu';

/*
 * useColorMode() — read or change light / dark mode anywhere in the app.
 * const { colorMode, toggleColorMode } = useColorMode();
 */
export function useColorMode() {
    const { resolvedTheme, setTheme } = useTheme();
    const colorMode = resolvedTheme === 'dark' ? 'dark' : 'light';

    const toggleColorMode = () => {
        setTheme(colorMode === 'dark' ? 'light' : 'dark');
    };

    return { colorMode, setColorMode: setTheme, toggleColorMode };
}

// Sun / moon button that switches the theme
export function ColorModeButton() {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <IconButton
            variant="ghost"
            size="sm"
            aria-label="Toggle dark mode"
            onClick={toggleColorMode}
        >
            {colorMode === 'dark' ? <LuSun /> : <LuMoon />}
        </IconButton>
    );
}
