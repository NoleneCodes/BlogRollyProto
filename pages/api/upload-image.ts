
import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createServerSupabaseClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const form = formidable({
      maxFileSize: 2 * 1024 * 1024, // 2MB limit
      filter: ({ mimetype }) => {
        return mimetype?.includes('image/') || false;
      }
    });

    const [fields, files] = await form.parse(req);
    const file = files.image?.[0];

    if (!file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.mimetype || '')) {
      return res.status(400).json({ error: 'Only JPG, PNG, and WebP files are allowed' });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = path.extname(file.originalFilename || '');
    const filename = `blog-image-${session.user.id}-${timestamp}${extension}`;

    // Read file content
    const fileContent = fs.readFileSync(file.filepath);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filename, fileContent, {
        contentType: file.mimetype || 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload image' });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filename);

    // Clean up temporary file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      imageUrl: publicUrl,
      filename: filename,
      filePath: uploadData.path
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
