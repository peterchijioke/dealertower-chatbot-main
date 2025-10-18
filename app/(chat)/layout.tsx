
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import Script from 'next/script'
import { DataStreamProvider } from '@/components/data-stream-provider'


import { ChatLayoutClient } from './layout-client'
import { getCurrentUserServer, getDealers } from '@/lib/auth-server'
import { Suspense, use } from 'react'
import Loading from './loading'
import { DealerSelectionOverlay } from '@/components/dealer-selection-overlay'
import { useDealer } from '@/stores/dealer-store'

export const experimental_ppr = true

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {


  return (
    <>
    
     <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      
      {/* <Suspense fallback={<Loading />}> */}
      
        <DataStreamProvider>
          <SidebarProvider>
            <ChatLayoutClient >
              {children}
            </ChatLayoutClient>
          </SidebarProvider>
        </DataStreamProvider>
      {/* </Suspense> */}
      </>
  )
}
