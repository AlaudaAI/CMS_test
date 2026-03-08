import { requireAuth } from '../../../../../lib/auth'
import { getTheme } from '../../../../../themes'
import DashboardShell from '../../../../../components/DashboardShell'
import PostForm from '../../../../../components/PostForm'

export const dynamic = 'force-dynamic'

export default async function NewPostPage() {
  const user = await requireAuth()
  const theme = await getTheme()

  return (
    <DashboardShell userEmail={user.email || ''} themeName={theme.name} hasMedia={theme.hasMedia}>
      <div className="dash-page">
        <div className="dash-page-header">
          <h1>New Post</h1>
        </div>
        <PostForm mode="create" />
      </div>
    </DashboardShell>
  )
}
