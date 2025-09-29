
/**
 * Basic Next.js config for local development
 */
const nextConfig = {
	images: {
		loader: 'default',
		domains: [
			'res.cloudinary.com',
			'picsum.photos',
			'images.unsplash.com'
		], // Allow Cloudinary, Picsum, and Unsplash demo images
		formats: ['image/avif', 'image/webp'],
	},
};

module.exports = nextConfig;
