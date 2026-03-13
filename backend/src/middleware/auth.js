import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
  const authHeader =
    req.headers.authorization ||
    req.headers.Authorization ||
    '';


   // TEMP LOG

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token)
    return res.status(401).json({ message: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

