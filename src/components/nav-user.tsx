import { UserButton, useUser } from '@clerk/clerk-react'

import { SidebarMenu, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'

export function NavUser() {
  const { user, isLoaded } = useUser()
  const { state } = useSidebar()

  const isCollapsed = state === 'collapsed'

  if (!isLoaded) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div
            className={
              isCollapsed
                ? 'flex justify-center px-2 py-1.5'
                : 'flex items-center gap-2 px-2 py-1.5 bg-accent rounded-sm'
            }
          >
            <div className="h-8 w-8 rounded-lg animate-pulse" />
            {!isCollapsed && (
              <div className="flex-1 space-y-1">
                <div className="h-4 rounded animate-pulse" />
                <div className="h-3 rounded w-3/4 animate-pulse" />
              </div>
            )}
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!user) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div
          className={
            isCollapsed
              ? 'flex justify-center px-2 py-1.5'
              : 'flex items-center gap-2 px-2 py-1.5 bg-accent rounded-sm'
          }
        >
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'h-8 w-8 rounded-lg',
              },
            }}
          />
          {!isCollapsed && (
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {user.fullName || user.username || 'User'}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user.primaryEmailAddress?.emailAddress || ''}
              </span>
            </div>
          )}
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
