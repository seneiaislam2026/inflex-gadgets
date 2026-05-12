import express from 'express';
import bcrypt from 'bcrypt';
import admin from 'firebase-admin';

const router = express.Router();

router.post('/register', async (req, res) => {
  const db = admin.firestore();
  try {
    const { name, email, password, uid } = req.body;

    // In Firebase, registration usually happens on client side
    // This server route could be used for creating the user profile in Firestore
    // if the client doesn't do it, or for admin creation.
    
    // Check if user already exists in Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      return res.status(400).json({ message: 'User profile already exists' });
    }

    const userData = {
      name,
      email,
      role: 'user', // Default role
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('users').doc(uid).set(userData);

    res.status(201).json({
      _id: uid,
      ...userData
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Note: Login is handled by Firebase Auth on the client side.
// The client will then use the ID token to authenticate with the API via middleware.
// We keep this route for legacy or specialized uses if needed, but Firebase Auth is preferred.
router.post('/login', async (req, res) => {
  // Usually the client signs in via Firebase SDK and passes the token.
  // If we really need a custom session login, we would verify password here (if we stored it).
  // But standard practice with Firebase is client-side auth.
  res.status(501).json({ message: 'Login should be handled by Firebase client SDK. Use the ID token in Authorization header.' });
});

export default router;
