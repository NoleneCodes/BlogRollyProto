
/**
 * Basic Next.js config for local development
 */
const nextConfig = {
	images: {
		loader: 'default',
		domains: ['res.cloudinary.com', 'picsum.photos'], // Allow Cloudinary and Picsum demo images
		formats: ['image/avif', 'image/webp'],
	},
};

module.exports = nextConfig;
