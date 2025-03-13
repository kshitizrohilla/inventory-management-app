import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { file, upload_preset } = req.body;
    const result = await cloudinary.uploader.upload(file, {
      upload_preset,
    });
    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}