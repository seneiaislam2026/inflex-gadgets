import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Get user from Firestore
      const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
      
      const user = userDoc.exists ? userDoc.data() : null;
      
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: user?.role || 'user',
        ...user
      };

      next();
    } catch (error) {
      console.error('Firebase Auth Error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const adminCheck = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
