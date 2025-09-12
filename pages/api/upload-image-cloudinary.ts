import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import cloudinary from 'cloudinary';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form data' });
    }
    let file = files.file as File | File[];
    // formidable may return an array or object
    if (Array.isArray(file)) {
      file = file[0];
    }
    try {
      const uploadResult = await cloudinary.v2.uploader.upload(file.filepath, {
        folder: 'blogrolly',
        resource_type: 'image',
      });
      return res.status(200).json({ url: uploadResult.secure_url });
    } catch (error) {
      return res.status(500).json({ error: 'Cloudinary upload failed', details: error });
    }
  });
}
