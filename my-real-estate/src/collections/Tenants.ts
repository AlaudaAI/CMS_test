import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/roles'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'siteName',
    defaultColumns: ['siteName', 'domain', 'industry', 'updatedAt'],
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
    { name: 'metaTitle', type: 'text' },
    { name: 'metaDescription', type: 'textarea' },
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
      maxRows: 6,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'desc', type: 'textarea', required: true },
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
    { name: 'footerText', type: 'text' },
    {
      name: 'industry',
      type: 'select',
      options: [
        { label: 'Real Estate', value: 'real-estate' },
        { label: 'Legal', value: 'legal' },
        { label: 'Restaurant', value: 'restaurant' },
        { label: 'Healthcare', value: 'healthcare' },
        { label: 'Other', value: 'other' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
