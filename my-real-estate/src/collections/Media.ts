import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    description: 'Upload images for use in blog posts (cover photos, inline images). Only image files (JPG, PNG, GIF, WebP, SVG) are accepted.',
    group: 'Content',
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  upload: {
    staticDir: '/tmp/media',
    mimeTypes: ['image/*'],
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
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Describe the image for accessibility (e.g. "Modern kitchen with marble countertops").',
      },
    },
  ],
}
