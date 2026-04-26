import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  orderBy,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Note {
  id?: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  createdAt: any;
  updatedAt: any;
}

const NOTES_COLLECTION = 'notes';

export const getNotes = async (userId: string): Promise<Note[]> => {
  const q = query(
    collection(db, NOTES_COLLECTION),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Note));
};

export const addNote = async (userId: string, title: string, content: string, category: string = 'General') => {
  return await addDoc(collection(db, NOTES_COLLECTION), {
    userId,
    title,
    content,
    category,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateNote = async (noteId: string, title: string, content: string, category?: string) => {
  const updateData: any = {
    title,
    content,
    updatedAt: serverTimestamp(),
  };
  if (category) updateData.category = category;
  
  const noteRef = doc(db, NOTES_COLLECTION, noteId);
  return await updateDoc(noteRef, updateData);
};

export const deleteNote = async (noteId: string) => {
  const noteRef = doc(db, NOTES_COLLECTION, noteId);
  return await deleteDoc(noteRef);
};
