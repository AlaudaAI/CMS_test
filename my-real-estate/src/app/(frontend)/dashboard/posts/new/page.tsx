import { requireAuth } from '../../../../../lib/auth'
import { getCurrentTenant, getTenantCategory } from '../../../../../lib/tenant'
import DashboardShell from '../../../../../components/DashboardShell'
import PostForm from '../../../../../components/PostForm'

export const dynamic = 'force-dynamic'

export default async function NewPostPage() {
  const user = await requireAuth()
  const tenant = await getCurrentTenant()
  const category = getTenantCategory(tenant) || 'real-estate'
  return (
    <DashboardShell userEmail={user.email || ''} themeName={tenant?.siteName || ''} hasMedia={true}>
      <div className="dash-page">
        <div className="dash-page-header">
          <h1>New Post</h1>
        </div>
        <PostForm mode="create" category={category} />
      </div>
    </DashboardShell>
  )
}
