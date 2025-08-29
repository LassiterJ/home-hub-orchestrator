import { userProcedure, router } from 'trpc'
const getRoleProc = userProcedure.query(() => ({ role: 'USER' as const }))

export const userRouter = router({
   roles: { getRoleProc }
})
