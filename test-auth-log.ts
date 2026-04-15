import { auth } from '@clerk/tanstack-react-start/server'
export const getAuthContext = async () => {
    const res = await auth();
    console.log(res);
}
