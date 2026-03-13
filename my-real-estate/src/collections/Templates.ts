import type { CollectionConfig } from 'payload'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '../access/roles'

export const Templates: CollectionConfig = {
  slug: 'templates',
  hooks: {
    afterChange: [() => { revalidatePath('/', 'layout') }],
  },
  admin: {
    useAsTitle: 'slug',
    group: 'Platform',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Real Estate', value: 'real-estate' },
        { label: 'Legal', value: 'legal' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'tokensCss', type: 'textarea', required: true },
    { name: 'chromeCss', type: 'textarea', required: true },
    { name: 'chromeHtml', type: 'textarea', required: true },
    { name: 'configJson', type: 'textarea', required: true, defaultValue: '{}' },
  ],
}
