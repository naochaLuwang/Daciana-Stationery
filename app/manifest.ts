// app/manifest.ts
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Daciana Stationery & Cosmetics',
        short_name: 'Daciana',
        description: 'Stationery and Cosmetics Store',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [

            {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/maskable-icon.png', // Create a new file for this
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
        ],
    }
}