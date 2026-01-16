import { useUser } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_appLayout/app/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user, isLoaded } = useUser()
  if (!isLoaded) return <div>Loading...</div>
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 overflow-x-auto">
        <div className="text-3xl">Hello App!</div>
        <pre className="p-4 border rounded">{JSON.stringify(user, null, 2)}</pre>
      </div>
    </div>
  )
}
