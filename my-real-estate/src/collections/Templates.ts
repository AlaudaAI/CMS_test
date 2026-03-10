import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/roles'

export const Templates: CollectionConfig = {
  slug: 'templates',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'updatedAt'],
    group: 'Platform',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, admin: { position: 'sidebar' } },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Real Estate', value: 'real-estate' },
        { label: 'Legal', value: 'legal' },
        { label: 'Restaurant', value: 'restaurant' },
        { label: 'Healthcare', value: 'healthcare' },
        { label: 'Other', value: 'other' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'tokensCss', type: 'code', required: true, admin: { language: 'css', description: 'CSS variables (:root)' } },
    { name: 'chromeCss', type: 'code', required: true, admin: { language: 'css', description: 'Header/footer/nav styles' } },
    { name: 'chromeHtml', type: 'code', required: true, admin: { language: 'html', description: 'HTML with {{title}}, {{nav}}, {{content}} placeholders' } },
    {
      name: 'configJson',
      type: 'json',
      admin: { description: '{ "fonts": [...], "externals": [...] }' },
    },
  ],
}
