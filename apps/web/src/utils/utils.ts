import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs))
}

export type getNewUUIDOptions = {
   prefix?: string;
   suffix?: string;
   delimiter?: string;
}
export const getNewUUID = ({ prefix, suffix = '' }: getNewUUIDOptions) => {
   const uuid = crypto.randomUUID()
   const addDelimiter = (str: string | undefined) => {
      if (!str || str.length === 0) {
         return ''
      }
      return `${str}-`
   }
   const _prefix = addDelimiter(prefix)
   const _uuid = addDelimiter(uuid)

   const fullUUID = `${_prefix}${_uuid}${suffix}`
   console.log('newUUID: ', fullUUID)
   return fullUUID
}
