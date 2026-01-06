import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { FeedManagementPage } from '@/pages/FeedManagementPage'
import { ArticleDetailPage } from '@/pages/ArticleDetailPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { TelemetryPage } from '@/pages/TelemetryPage'
const queryClient = new QueryClient();

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.ts', { type: 'module' })
      .then(registration => {
        console.log('SW registered: ', registration);
        // Trigger a prune on startup
        registration.active?.postMessage({ type: 'PRUNE_DATA' });
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/article/:id",
    element: <ArticleDetailPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/feeds",
    element: <FeedManagementPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/telemetry",
    element: <TelemetryPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
    errorElement: <RouteErrorBoundary />,
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)