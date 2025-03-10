import dbConnect from '../../../lib/dbConnect';
import Product from '../../../models/Product';
import { authMiddleware } from '../../../middleware/authMiddleware';

export default async function handler(req, res) {
  await dbConnect();

  const auth = await authMiddleware(req);
  if (!auth.success) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const product = await Product.create({
      ...req.body,
      user: auth.user._id,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A product with this barcode already exists for this user.' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
}