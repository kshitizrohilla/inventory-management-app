import dbConnect from '../../../../lib/dbConnect';
import Product from '../../../../models/Product';
import { authMiddleware } from '../../../../middleware/authMiddleware';

export default async function handler(req, res) {
  await dbConnect();

  const auth = await authMiddleware(req);
  if (!auth.success) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { barcode } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const product = await Product.findOne({
      barcode: barcode,
      user: auth.user._id
    });

    if (!product) {
      return res.status(200).json({ success: true, data: null });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}