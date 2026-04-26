import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface UserSettings {
  language: string;
  voiceName: string;
  playbackSpeed: number;
  cloudSync: boolean;
}

export interface UserProfile {
  userId: string;
  settings?: UserSettings;
  categories?: string[];
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function saveUserSettings(userId: string, settings: UserSettings): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      await updateDoc(docRef, { settings });
    } else {
      await setDoc(docRef, { 
        userId, 
        settings,
        categories: ['General', 'Work', 'Personal', 'Ideas'] 
      });
    }
  } catch (error) {
    console.error("Error saving user settings:", error);
  }
}
