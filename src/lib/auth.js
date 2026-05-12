import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export async function ensureUserProfile(user, preferredUsername) {
  if (!user?.uid) return;

  const fallbackFromEmail = user.email?.split("@")[0] || "user";
  const username = (preferredUsername || user.displayName || fallbackFromEmail).trim();

  await setDoc(
    doc(db, "users", user.uid),
    {
      username,
      email: user.email || "",
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

export function subscribeAuth(callback, onError) {
  return onAuthStateChanged(auth, callback, onError);
}

export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function register(email, password, username) {
  const cleanName = (username || "").trim();
  if (!cleanName) {
    throw new Error("Username is required.");
  }

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: cleanName });
  await ensureUserProfile(cred.user, cleanName);
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}

export function mapAuthError(error) {
  const code = error?.code || "";

  if (code === "auth/operation-not-allowed") {
    return "Email/Password sign-in is disabled. Enable it in Firebase Console > Authentication > Sign-in method.";
  }

  if (code === "auth/invalid-api-key") {
    return "Invalid Firebase API key. Recheck firebase config values from token.txt.";
  }

  if (code === "auth/unauthorized-domain") {
    return "This localhost domain is not authorized. Add localhost to Firebase Console > Authentication > Settings > Authorized domains.";
  }

  if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
    return "Invalid email or password.";
  }

  if (code === "auth/email-already-in-use") {
    return "This email is already registered. Try signing in instead.";
  }

  if (code === "auth/too-many-requests") {
    return "Too many attempts. Please wait a few minutes and try again.";
  }

  return error?.message || "Authentication failed";
}
