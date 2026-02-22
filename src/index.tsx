import './index.css';
console.log('🚀 Koda Admin Initializing...');
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";

const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    );

    // Unregister any existing service workers to prevent aggressive caching white-screens
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                for (let registration of registrations) {
                    registration.unregister().then(boolean => {
                        console.log('SW unregistered:', boolean);
                    });
                }
            });
        });
    }
}