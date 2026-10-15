import { ChakraProvider } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes';
import { system } from '@/theme/theme';

/*
 * Wraps the app with Chakra UI (our theme) and next-themes (light / dark mode).
 * next-themes adds class="dark" or class="light" to <html> and remembers the choice.
 */
export function Provider({ children }) {
    return (
        <ChakraProvider value={system}>
            <ThemeProvider attribute="class" disableTransitionOnChange>
                {children}
            </ThemeProvider>
        </ChakraProvider>
    );
}
