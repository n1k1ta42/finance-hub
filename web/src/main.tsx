import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client' // Import the generated route tree

import { QueryProvider } from './providers/query-provider'
import { routeTree } from './routeTree.gen'

import './styles.css'

import { ThemeProvider } from '@/components/theme-provider.tsx' // Create a new router instance
import { Toaster } from '@/components/ui/toaster'

import reportWebVitals from './reportWebVitals.ts'

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  defaultViewTransition: true,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryProvider>
        <ThemeProvider defaultTheme='system' storageKey='ui-theme'>
          <RouterProvider router={router} />
          <Toaster />
        </ThemeProvider>
      </QueryProvider>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log)
