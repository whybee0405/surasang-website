/**
 * CloudIA CMS models for surasang.co.za.
 *
 * The site reads these at build time over the native API (src/lib/cms.js) and posts the
 * contact form to the Payload-compatible form route (/api/messages). Seed content for every
 * collection lives in src/data/seed.js; `npm run cms:export` turns it into import files.
 */
import type { CloudiaConfig } from '@cloudia-cms/client/config'

const config: CloudiaConfig = {
  site: {
    name: 'Surasang',
    slug: 'surasang',
    domains: ['surasang.co.za', 'www.surasang.co.za'],
  },
  // Enables /api/<form> submissions and the keyless analytics route used by the tracker.
  payloadCompat: { analytics: 'analytics-events' },
  dashboard: { theme: 'nocturne', mode: 'dark', accent: '#d4b153' },

  singletons: [
    {
      slug: 'site-settings',
      name: 'Site settings',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'heroTitle', type: 'text', required: true, help: 'Keep it under eight words.' },
        { name: 'heroText', type: 'textarea', help: 'One sentence, about twenty words.' },
        { name: 'googleRating', type: 'number' },
        { name: 'googleReviews', type: 'number' },
        { name: 'uberEatsUrl', type: 'url' },
        { name: 'instagram', type: 'url' },
        { name: 'tiktok', type: 'url' },
        { name: 'facebook', type: 'url' },
        { name: 'pochaInstagram', type: 'url' },
        { name: 'pochaTiktok', type: 'url' },
        { name: 'menuPdf', type: 'url', help: 'Printable menu, linked from the menu index.' },
        { name: 'announcementOn', type: 'boolean', default: false, label: 'Show announcement' },
        { name: 'announcementTitle', type: 'text' },
        { name: 'announcementText', type: 'textarea' },
      ],
    },
  ],

  collections: [
    {
      slug: 'menu-sections',
      name: 'Menu sections',
      titleField: 'title',
      sortField: 'order',
      description: 'Chapters of the menu, in page order.',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'korean', type: 'text', help: 'Shown large behind the chapter title.' },
        { name: 'brand', type: 'select', options: ['surasang', 'pocha'], default: 'surasang', required: true },
        { name: 'order', type: 'number', required: true },
        { name: 'intro', type: 'textarea' },
        { name: 'note', type: 'textarea', help: 'Small print: minimums, what comes with it.' },
        { name: 'image', type: 'image' },
      ],
    },
    {
      slug: 'menu-items',
      name: 'Menu items',
      titleField: 'name',
      sortField: 'order',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'korean', type: 'text' },
        { name: 'section', type: 'relation', relation: 'menu-sections', required: true },
        { name: 'group', type: 'text', help: 'Optional sub-heading inside the section, e.g. Beef, Pork, Sets for two.' },
        { name: 'price', type: 'number', help: 'Rand, no symbol. Used by the hot pot builder.' },
        { name: 'priceLabel', type: 'text', help: 'Overrides the printed price, e.g. "R155 / R255".' },
        { name: 'description', type: 'textarea' },
        { name: 'options', type: 'textarea', help: 'One add-on per line, e.g. "Add cheese +R40".' },
        { name: 'tags', type: 'multiselect', options: ['spicy', 'share', 'signature'] },
        { name: 'serves', type: 'text', help: 'e.g. 2-3' },
        { name: 'image', type: 'image' },
        { name: 'order', type: 'number', required: true },
        { name: 'available', type: 'boolean', default: true, help: 'Untick to hide a dish without deleting it.' },
      ],
    },
    {
      slug: 'branches',
      titleField: 'name',
      sortField: 'order',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'area', type: 'text', required: true },
        { name: 'status', type: 'select', options: ['open', 'moving', 'coming-soon'], default: 'open', required: true },
        { name: 'address', type: 'textarea', required: true },
        { name: 'phone', type: 'text' },
        { name: 'whatsapp', type: 'text', help: 'WhatsApp number with country code, e.g. +27 65 737 4266. Leave empty to hide this branch from the WhatsApp button.' },
        { name: 'email', type: 'email' },
        { name: 'mapUrl', type: 'url' },
        { name: 'dineplanKey', type: 'text', help: 'The key from the Dineplan widget, e.g. rV7fQwH0.' },
        { name: 'hours', type: 'textarea' },
        { name: 'note', type: 'text' },
        { name: 'image', type: 'image' },
        { name: 'order', type: 'number', required: true },
      ],
    },
    {
      slug: 'reviews',
      titleField: 'author',
      sortField: 'order',
      fields: [
        { name: 'quote', type: 'textarea', required: true, help: 'Three lines at most on the page.' },
        { name: 'author', type: 'text', required: true },
        { name: 'source', type: 'text', default: 'Google' },
        { name: 'order', type: 'number', required: true },
      ],
    },
    {
      slug: 'messages',
      name: 'Messages',
      kind: 'form',
      titleField: 'name',
      description: 'Compliments, complaints and questions from the contact form.',
      form: {
        accept: ['name', 'email', 'branch', 'message', 'website'],
        honeypot: 'website',
        metaField: 'meta',
        rateLimit: { max: 5, windowMinutes: 10 },
        subjectField: 'name',
        // Who gets an email for each message. Needs SMTP in cloudia/cms.env (Resend: see cms.env.example).
        // notify: 'owner@surasang.co.za, manager@surasang.co.za',
      },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'branch', type: 'select', options: ['parkhurst', 'pocha-parkhurst', 'dainfern', 'general'], default: 'general' },
        { name: 'message', type: 'textarea', required: true },
        { name: 'website', type: 'text', help: 'Honeypot. Always empty for real visitors.' },
        { name: 'meta', type: 'json' },
      ],
    },
  ],
}

export default config
