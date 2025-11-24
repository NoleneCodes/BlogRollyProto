/**
 * Basic Next.js config for local development
 */
const nextConfig = {
	images: {
		loader: 'default',
		formats: ['image/avif', 'image/webp'],
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**', // Allows all HTTPS domains
			},
			{
				protocol: 'https',
				hostname: 'res.cloudinary.com',
			},
			{
				protocol: 'https',
				hostname: 'picsum.photos',
			},
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
			},
			// Add your Supabase storage pattern for profile pictures
			{
				protocol: 'https',
				hostname: '*.supabase.co',
			}
		],
	},
};

module.exports = nextConfig;