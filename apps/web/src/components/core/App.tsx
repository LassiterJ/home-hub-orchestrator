import { createRouter } from '@tanstack/react-router'

import { routeTree } from '../../routeTree.gen'

import { Providers } from '../shared'






// Create router
const router = createRouter({ routeTree })
// Create a new router instance
export type RouterInstance = typeof router

export const App = () => {
   return (
      <main className={"h-full"}>
         <Providers router={router} />
      </main>
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

