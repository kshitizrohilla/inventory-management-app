import dbConnect from '../../../lib/dbConnect';
import Product from '../../../models/Product';
import { authMiddleware } from '../../../middleware/authMiddleware';

export default async function handler(req, res) {
  await dbConnect();

  const auth = await authMiddleware(req);
  if (!auth.success) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const products = await Product.find({ user: auth.user._id });
        res.status(200).json({ success: true, data: products });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;
    default:
      res.status(400).json({ success: false, message: 'Invalid method' });
      break;
  }
}