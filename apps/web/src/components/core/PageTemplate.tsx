'use client'

import * as React from 'react'

import { Separator } from '@/components/ui/Separator'
import { cn } from '@/utils'


/**
 * PageTemplate
 *
 * A minimal, opinionated page shell that ensures pages take up the full
 * available viewport space and provide a consistent header/content/footer
 * layout. No breadcrumbs or tabs are included per requirements.
 *
 * Layout contract:
 * - Root wrapper is a flex column with min-h-svh to guarantee full-screen
 *   sizing. This cooperates with surrounding layouts (e.g., sidebar wrappers).
 * - Header is optional and sticky; when present it stays at the top and casts
 *   a subtle shadow when content scrolls beneath.
 * - Content fills remaining space and is scrollable. We apply min-h-0 to avoid
 *   the common flexbox overflow trap where children cannot shrink.
 * - Footer is optional and non-sticky; it renders after the content area.
 */
export type PageTemplateProps = {
   /** Title rendered in the page header */
   title?: React.ReactNode
   /** Optional short description rendered under the title */
   description?: React.ReactNode
   /** Right-aligned actions in the header (e.g., buttons) */
   actions?: React.ReactNode
   /** Optional footer node rendered at the very bottom */
   footer?: React.ReactNode

   /** Constrain inner content width; defaults to full width */
   maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
   /** Apply standard padding to the content area */
   padded?: boolean

   /** Root wrapper className overrides */
   className?: string
   /** Header wrapper className overrides */
   headerClassName?: string
   /** Content wrapper className overrides */
   contentClassName?: string
   /** Footer wrapper className overrides */
   footerClassName?: string

   children?: React.ReactNode
}

const widthMap: Record<NonNullable<PageTemplateProps['maxWidth']>, string> = {
   sm: 'max-w-screen-sm',
   md: 'max-w-screen-md',
   lg: 'max-w-screen-lg',
   xl: 'max-w-screen-xl',
   full: 'max-w-none',
}

export function PageTemplate({
                                title,
                                description,
                                actions,
                                footer,
                                maxWidth = 'full',
                                padded = true,
                                className,
                                headerClassName,
                                contentClassName,
                                footerClassName,
                                children,
                             }: PageTemplateProps) {

   const constrained = widthMap[maxWidth]
   const containerPadding = padded ? 'px-4 md:px-6' : ''

   return (
      <div
         data-slot="page-template"
         className={cn('min-h-svh w-full flex flex-col bg-background', className)}
      >
         {(title || description || actions) && (
            <header
               className={cn(
                  'sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60',
                  'border-b',
                  headerClassName,
               )}
            >
               <div className={cn('mx-auto w-full', constrained, containerPadding)}>
                  <div className="flex items-start justify-between gap-4 py-3 md:py-4">
                     <div className="min-w-0">
                        {title && (
                           <h1 className="text-lg md:text-xl font-semibold leading-tight truncate">{title}</h1>
                        )}
                        {description && (
                           <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
                        )}
                     </div>
                     {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
                  </div>
               </div>
            </header>
         )}

         {/*
       * Content area fills the remaining space of the viewport and scrolls.
       * min-h-0 is critical inside flex columns to allow the child to shrink.
       */}
         <main
            data-slot="page-content"
            className={cn('flex-1 min-h-0 w-full overflow-auto', contentClassName)}
         >
            <div className={cn('mx-auto w-full', constrained, containerPadding)}>
               {children}
            </div>
         </main>

         {footer && (
            <>
               <Separator className="mt-2" />
               <footer data-slot="page-footer" className={cn('w-full', footerClassName)}>
                  <div className={cn('mx-auto w-full py-3 md:py-4', constrained, containerPadding)}>
                     {footer}
                  </div>
               </footer>
            </>
         )}
      </div>
   )
}


