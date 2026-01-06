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
import { ComingSoonPage } from '@/pages/ComingSoonPage'
const queryClient = new QueryClient();
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
    element: <ComingSoonPage title="Telemetry Dashboard" />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/settings",
    element: <ComingSoonPage title="Settings & Privacy" />,
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