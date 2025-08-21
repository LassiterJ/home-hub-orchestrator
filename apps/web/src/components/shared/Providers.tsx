import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { ThemeProvider } from 'styled-components'
import { TRPCProvider } from '../../utils/trpc';

import { RouterInstance } from '../core/App'

import { theme } from 'styles'
import 'styles/index.scss'
import {createTRPCClient, httpBatchLink, httpLink, isNonJsonSerializable, splitLink} from "@trpc/client";
import {AppRouter} from "../../../../server/src/trpc";
import {useState} from "react";


interface ProvidersProps {
   router: RouterInstance
}
function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // With SSR, we usually want to set some default staleTime
                // above 0 to avoid refetching immediately on the client
                staleTime: 60 * 1000,
            },
        },
    });
}
let browserQueryClient: QueryClient | undefined = undefined;
function getQueryClient() {
    if (typeof window === 'undefined') {
        // Server: always make a new query client
        return makeQueryClient();
    } else {
        // Browser: make a new query client if we don't already have one
        // This is very important, so we don't re-make a new client if React
        // suspends during the initial render. This may not be needed if we
        // have a suspense boundary BELOW the creation of the query client
        if (!browserQueryClient) browserQueryClient = makeQueryClient();
        return browserQueryClient;
    }
}

export const Providers = ({ router }: ProvidersProps) => {
    const queryClient = getQueryClient();
    console.log("queryClient: ", queryClient);
    const [trpcClient] = useState(() => {
            const url = `${(import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001').replace(/\/$/, '')}/trpc`;
            console.log('trpcClientURL: ', url);
            return createTRPCClient<AppRouter>({
                links: [
                    splitLink({
                        // If the input isn't JSON-serializable (Blob/File/Uint8Array/FormData), use httpLink
                        condition: (op) => isNonJsonSerializable(op.input),
                        true: httpLink({
                            url: url,
                        }),
                        false: httpBatchLink({
                            url: url,
                        }),
                    }),
                ],
            })
        }
    );
   return (
      <QueryClientProvider client={queryClient}>
         <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
            <ThemeProvider theme={theme}>
               <RouterProvider router={router} />
            </ThemeProvider>
         </TRPCProvider>
      </QueryClientProvider>
   )
}
