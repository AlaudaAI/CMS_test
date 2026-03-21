import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/roles'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt', 'updatedAt'],
    description: 'Blog posts managed via the custom dashboard.',
    group: 'Content',
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'real-estate',
      options: [
        { label: 'Real Estate', value: 'real-estate' },
        { label: 'Legal', value: 'legal' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, admin: { position: 'sidebar' } },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'excerpt', type: 'textarea', maxLength: 300 },
    { name: 'contentHtml', type: 'textarea', required: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
  ],
}
