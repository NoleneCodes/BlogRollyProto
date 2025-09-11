import type { NextApiRequest, NextApiResponse } from 'next';
import cloudinary from 'cloudinary';

// Set your Cloudinary credentials in environment variables
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

import { IncomingForm } from 'formidable';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Form parse error' });
    }
    let file = files.image;
    if (!file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    // formidable may return an array or object
    if (Array.isArray(file)) {
      file = file[0];
    }
    try {
      const uploadResult = await cloudinary.v2.uploader.upload(file.filepath, {
        folder: 'blogrolly', // Optional: organize images in a folder
        resource_type: 'image',
      });
      // Clean up temp file
      fs.unlinkSync(file.filepath);
      return res.status(200).json({
        success: true,
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Cloudinary upload failed', details: error });
    }
  });
}
