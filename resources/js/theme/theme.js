import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

/*
 * ALL colors, fonts and light/dark values of the app live in this file.
 * Components use token names (bg="app.card", colorPalette="brand"), never hex values.
 */

// Plain hex values for libraries outside Chakra (SweetAlert, charts, maps).
export const brandColors = {
    primary: '#ff4f01', // MotoTrack orange
    danger: '#ee193d', // red — delete / urgent only
    warning: '#ec9606', // amber — pending / warnings
    darkCard: '#1f1f23',
};

const config = defineConfig({
    // Page background and text color for the whole app
    globalCss: {
        body: {
            bg: 'app.bg',
            color: 'app.text',
        },
    },
    theme: {
        tokens: {
            fonts: {
                heading: { value: `'Inter', sans-serif` },
                body: { value: `'Inter', sans-serif` },
            },
            colors: {
                brand: {
                    50: { value: '#fff3ec' },
                    100: { value: '#ffe0cc' },
                    200: { value: '#ffc099' },
                    300: { value: '#ff9a5c' },
                    400: { value: '#ff7329' },
                    500: { value: '#ff4f01' },
                    600: { value: '#db4000' },
                    700: { value: '#b03300' },
                    800: { value: '#852700' },
                    900: { value: '#5c1b00' },
                    950: { value: '#3d1200' },
                },
                danger: { 500: { value: '#ee193d' } },
                warning: { 500: { value: '#ec9606' } },
            },
        },
        semanticTokens: {
            colors: {
                // Needed so <Button colorPalette="brand"> works in light and dark mode
                brand: {
                    solid: { value: '{colors.brand.500}' },
                    contrast: { value: 'white' },
                    fg: {
                        value: {
                            _light: '{colors.brand.600}',
                            _dark: '{colors.brand.400}',
                        },
                    },
                    muted: {
                        value: {
                            _light: '{colors.brand.100}',
                            _dark: '{colors.brand.900}',
                        },
                    },
                    subtle: {
                        value: {
                            _light: '{colors.brand.50}',
                            _dark: '{colors.brand.950}',
                        },
                    },
                    emphasized: {
                        value: {
                            _light: '{colors.brand.200}',
                            _dark: '{colors.brand.800}',
                        },
                    },
                    focusRing: { value: '{colors.brand.500}' },
                },
                // App surfaces — use these instead of white / gray hex
                app: {
                    bg: { value: { _light: '{colors.gray.50}', _dark: '#141416' } },
                    card: { value: { _light: 'white', _dark: '#1f1f23' } },
                    sidebar: { value: { _light: 'white', _dark: '#1a1a1d' } },
                    border: {
                        value: {
                            _light: '{colors.gray.200}',
                            _dark: '{colors.gray.700}',
                        },
                    },
                    text: {
                        value: {
                            _light: '{colors.gray.900}',
                            _dark: '{colors.gray.100}',
                        },
                    },
                    muted: {
                        value: {
                            _light: '{colors.gray.500}',
                            _dark: '{colors.gray.400}',
                        },
                    },
                },
            },
        },
    },
});

export const system = createSystem(defaultConfig, config);
