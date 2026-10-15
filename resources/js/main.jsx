import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import { Provider as ChakraProvider } from '@/components/ui/provider';
import { store } from '@/store';

/*
 * Entry point of the React app (loaded by resources/views/app.blade.php).
 * Order: Redux store -> Chakra UI + dark mode -> Router -> App
 */
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ReduxProvider store={store}>
            <ChakraProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </ChakraProvider>
        </ReduxProvider>
    </StrictMode>,
);
