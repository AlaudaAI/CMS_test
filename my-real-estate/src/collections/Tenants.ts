import type { CollectionConfig } from 'payload'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '../access/roles'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  hooks: {
    afterChange: [() => { revalidatePath('/', 'layout') }],
  },
  admin: {
    useAsTitle: 'siteName',
    group: 'Platform',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'domain', type: 'text', required: true, unique: true },
    { name: 'template', type: 'relationship', relationTo: 'templates', required: true },
    { name: 'siteName', type: 'text', required: true },
    { name: 'tagline', type: 'text' },
    {
      name: 'meta',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
      ],
    },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'sub', type: 'text' },
        { name: 'cta', type: 'text' },
      ],
    },
    {
      name: 'features',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'desc', type: 'text', required: true },
      ],
    },
    {
      name: 'navLinks',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    {
      name: 'blog',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'Blog' },
        { name: 'sub', type: 'text' },
      ],
    },
    { name: 'footerText', type: 'text' },
  ],
}
