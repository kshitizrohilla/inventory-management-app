import jwt from 'jsonwebtoken';
import User from '../models/User';
import dbConnect from '../lib/dbConnect';

export async function authMiddleware(req) {
  await dbConnect();

  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return { success: false };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return { success: false };
    }

    return { success: true, user };
  } catch (error) {
    return { success: false };
  }
}