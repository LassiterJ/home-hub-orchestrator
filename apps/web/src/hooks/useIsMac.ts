import { useEffect, useState } from 'react'

export function useIsMac() {
   const [isMac, setIsMac] = useState(true)
// TODO: If userAgentData becomes stable implement that instead  navigator.platform is deprecated
   useEffect(() => {
      setIsMac(navigator.platform.toUpperCase().includes('MAC'))
   }, [])

   return isMac
}
