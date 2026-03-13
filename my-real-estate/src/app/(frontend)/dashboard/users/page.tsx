import { getPayload } from 'payload'
import config from '../../../../payload.config'
import { requireAuth } from '../../../../lib/auth'
import { getCurrentTenant } from '../../../../lib/tenant'
import DashboardShell from '../../../../components/DashboardShell'
import { CreateUserForm, DeleteUserButton } from './UsersClient'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const user = await requireAuth()
  const tenant = await getCurrentTenant()
  const payload = await getPayload({ config })
  const { docs: users } = await payload.find({
    collection: 'users',
    sort: '-createdAt',
    limit: 100,
    overrideAccess: true,
  })

  const isAdmin = (user as unknown as Record<string, unknown>).role === 'admin'

  return (
    <DashboardShell userEmail={user.email || ''} themeName={tenant?.siteName || ''} hasMedia={true}>
      <div className="dash-page">
        <div className="dash-page-header">
          <h1>Users</h1>
        </div>

        {isAdmin && <CreateUserForm />}

        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>
                    <span className={`status-badge status-${(u as unknown as Record<string, unknown>).role}`}>
                      {String((u as unknown as Record<string, unknown>).role)}
                    </span>
                  </td>
                  <td className="text-muted">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  {isAdmin && (
                    <td>
                      {u.id !== user.id && (
                        <DeleteUserButton userId={String(u.id)} userEmail={u.email} />
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  )
}
