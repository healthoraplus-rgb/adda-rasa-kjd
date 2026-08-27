import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
  signOut,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Provider with Spreadsheets & Profile Scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.setCustomParameters({
  prompt: 'select_account',
});

const ACCESS_TOKEN_KEY = 'addarasa_google_access_token';
const USER_EMAIL_KEY = 'addarasa_google_user_email';
const USER_NAME_KEY = 'addarasa_google_user_name';
const TOKEN_TIME_KEY = 'addarasa_google_token_time';

let isSigningIn = false;
let cachedAccessToken: string | null = (() => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
})();

/**
 * Initialize auth state listener and restore cached access token
 */
export const initAuth = (
  onAuthSuccess?: (user: FirebaseUser | { email?: string; displayName?: string }, token: string) => void,
  onAuthFailure?: () => void
) => {
  // Check if we already have a cached token in localStorage
  const savedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const savedEmail = localStorage.getItem(USER_EMAIL_KEY);
  const savedName = localStorage.getItem(USER_NAME_KEY);

  if (savedToken && savedEmail) {
    cachedAccessToken = savedToken;
    if (onAuthSuccess) {
      onAuthSuccess(
        { email: savedEmail, displayName: savedName || 'Google User' },
        savedToken
      );
    }
  }

  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user) {
      const currentToken = cachedAccessToken || localStorage.getItem(ACCESS_TOKEN_KEY);
      if (currentToken) {
        if (onAuthSuccess) onAuthSuccess(user, currentToken);
      }
    } else {
      if (!localStorage.getItem(ACCESS_TOKEN_KEY) && !isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

/**
 * Interactive Sign-In via Pop-up window (signInWithPopup)
 * Safe for Netlify, Vercel, and modern browsers with 3rd-party cookie blocking.
 */
export const googleSignIn = async (): Promise<{
  user: { email?: string | null; displayName?: string | null };
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;

    // Use Firebase Auth signInWithPopup with explicit resolver
    const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;

    if (!token) {
      throw new Error(
        'Gagal mendapatkan token akses Google Sheets dari pop-up. Pastikan Anda menyetujui izin akses spreadsheet.'
      );
    }

    cachedAccessToken = token;
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      if (result.user.email) localStorage.setItem(USER_EMAIL_KEY, result.user.email);
      if (result.user.displayName) localStorage.setItem(USER_NAME_KEY, result.user.displayName);
      localStorage.setItem(TOKEN_TIME_KEY, Date.now().toString());
    } catch {
      // ignore storage error
    }

    return {
      user: {
        email: result.user.email,
        displayName: result.user.displayName,
      },
      accessToken: token,
    };
  } catch (error: any) {
    console.error('Google Popup Sign-in Error:', error);

    // Provide friendly Indonesian error messages for common pop-up & Netlify hosting scenarios
    if (error?.code === 'auth/popup-blocked') {
      throw new Error(
        'Jendela pop-up login diblokir oleh browser. Silakan nonaktifkan pop-up blocker atau klik ikon pop-up di bilah alamat browser, lalu coba lagi.'
      );
    } else if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request'
    ) {
      throw new Error('Jendela login pop-up ditutup sebelum otentikasi selesai. Silakan coba lagi.');
    } else if (error?.code === 'auth/unauthorized-domain') {
      throw new Error(
        'Domain website saat ini belum terdaftar di Firebase Authorized Domains. Tambahkan domain Netlify Anda di Firebase Console > Authentication > Settings > Authorized Domains.'
      );
    } else if (error?.code === 'auth/network-request-failed') {
      throw new Error('Koneksi internet bermasalah atau gagal menghubungi server Google.');
    }

    throw new Error(error?.message || 'Gagal login dengan Google Pop-up.');
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get current stored Google OAuth Access Token
 */
export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;
  try {
    const saved = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (saved) {
      cachedAccessToken = saved;
      return saved;
    }
  } catch {
    // ignore
  }
  return null;
};

/**
 * Manually set or update access token
 */
export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
  try {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      localStorage.setItem(TOKEN_TIME_KEY, Date.now().toString());
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(USER_EMAIL_KEY);
      localStorage.removeItem(USER_NAME_KEY);
      localStorage.removeItem(TOKEN_TIME_KEY);
    }
  } catch {
    // ignore
  }
};

/**
 * Logout and clear token and credentials
 */
export const logoutGoogle = async () => {
  try {
    await signOut(auth);
  } catch {
    // ignore
  }
  setAccessToken(null);
};

