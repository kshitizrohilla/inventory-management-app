import dbConnect from '../../../lib/dbConnect';
import Sale from '../../../models/Sale';
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
        const sales = await Sale.find({ userId: auth.user._id }).sort({ timestamp: -1 });
        res.status(200).json({ success: true, data: sales });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;
    case 'POST':
      try {
        const sale = await Sale.create({
          ...req.body,
          userId: auth.user._id,
        });
        res.status(201).json({ success: true, data: sale });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;
    default:
      res.status(400).json({ success: false, message: 'Invalid method' });
      break;
  }
}