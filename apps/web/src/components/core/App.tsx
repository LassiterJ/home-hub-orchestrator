import { Outlet, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import styled from 'styled-components'
import { routeTree } from '../../routeTree.gen'
// Optional Devtools:
// import { TanStackRouterDevtools } from '@tanstack/router-devtools'

import { Home } from 'components/features'

import { Providers } from '../shared'
import {Route} from "../../routes/__root";

// TODO: I think I can delete these as we are using file based-routing.
// // Root route
// const rootRoute = createRootRoute({
//    component: () => Route ,
// })
//
// // Child routes
// const homeRoute = createRoute({
//    getParentRoute: () => rootRoute,
//    path: '/home',
//    component: Home,
// })
//
// const cvTestRoute = createRoute({
//    getParentRoute: () => rootRoute,
//    path: '/cv-test',
//    component: Home,
// })

// Import the generated route tree


// Create a new router instance

// Create router
const router = createRouter({ routeTree })
export type RouterInstance = typeof router
//
// // Make navigate available for your starter’s pattern, if you still want it.
// declare global {
//    interface Window {
//       navigate: typeof router.navigate
//    }
// }
// if (typeof window !== 'undefined') {
//    // @ts-expect-error - augmenting window for convenience
//    window.navigate = router.navigate
// }
//
// // Module augmentation for types
// declare module '@tanstack/react-router' {
//    interface Register {
//       router: RouterInstance
//    }
// }

export const App = () => {
   return (
      <AppContainer>
         <Providers router={router} />
      </AppContainer>
   )
}
// export const App = () => {
//    return (
//       <AppContainer>
//          <QueryClientProvider client={queryClient}>
//             <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
//                <GlobalStyle />
//                <RouterProvider router={router} />
//                <TanStackRouterDevtools position="bottom-right" />
//             </TRPCProvider>
//          </QueryClientProvider>
//       </AppContainer>
//    )
// }

const AppContainer = styled.div`
   height: 100%;
`
