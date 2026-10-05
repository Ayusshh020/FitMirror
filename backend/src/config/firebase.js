const admin = require('firebase-admin');
const env = require('./env');

let firebaseAdmin = null;
let isConfigured = false;

try {
  const serviceAccountRaw = env.firebaseServiceAccountJson || process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountRaw) {
    let serviceAccount;
    try {
      serviceAccount = typeof serviceAccountRaw === 'object' ? serviceAccountRaw : JSON.parse(serviceAccountRaw);
    } catch (e) {
      console.warn('[Firebase] FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON format.');
    }

    if (serviceAccount) {
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      isConfigured = true;
      console.log('[Firebase] Admin SDK initialized successfully for Authentication.');
    }
  } else {
    console.log('[Firebase] Admin SDK not configured (FIREBASE_SERVICE_ACCOUNT_JSON missing).');
  }
} catch (error) {
  console.warn('[Firebase] Warning during initialization:', error.message);
}

const verifyFirebaseIdToken = async (idToken) => {
  if (!isConfigured || !firebaseAdmin) {
    throw new Error('Firebase Admin SDK is not configured on server.');
  }
  return await firebaseAdmin.auth().verifyIdToken(idToken);
};

module.exports = {
  admin: firebaseAdmin,
  isConfigured,
  verifyFirebaseIdToken,
};
