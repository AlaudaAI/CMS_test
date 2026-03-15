import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminField } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    description: 'Manage user accounts. Admins can create and manage all users. Editors can create and edit posts.',
    group: 'Settings',
  },
  auth: true,
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: {
        update: isAdminField,
      },
      admin: {
        description: 'Admins have full access. Editors can only manage posts and media.',
      },
    },
  ],
}
