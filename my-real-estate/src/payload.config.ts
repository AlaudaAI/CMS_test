import path from 'path'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Posts } from './collections/Posts'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { Templates } from './collections/Templates'
import { Tenants } from './collections/Tenants'
import { Services } from './collections/extensions/Services'
import { Staff } from './collections/extensions/Staff'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — CMS Platform',
    },
  },
  collections: [Users, Media, Posts, Templates, Tenants, Services, Staff],
  plugins: [
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [vercelBlobStorage({ collections: { media: true }, token: process.env.BLOB_READ_WRITE_TOKEN })]
      : []),
    multiTenantPlugin({
      collections: {
        posts: {},
        media: {},
        services: {},
        staff: {},
      },
      userHasAccessToAllTenants: (user: any) => user?.role === 'admin',
    }),
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'default-secret',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL,
    },
    push: true,
  }),
  sharp,
})
