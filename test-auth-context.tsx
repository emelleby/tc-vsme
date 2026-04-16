import { auth, clerkClient } from '@clerk/tanstack-react-start/server'
export const getClerkUser = async (userId: string) => {
  const client = await clerkClient()
  return client.users.getUser(userId)
}
