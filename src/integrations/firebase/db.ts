import { db, storage } from './client';
import { 
  doc, 
  collection, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

// User profile functions
export const getUserProfile = async (userId: string) => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};

export const updateUserProfile = async (userId: string, data: any) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
  return true;
};

// Health data functions
export const saveHealthData = async (userId: string, data: any) => {
  const healthRef = doc(db, 'healthData', userId);
  await setDoc(healthRef, {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
  return true;
};

export const getHealthData = async (userId: string) => {
  const docRef = doc(db, 'healthData', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
};

// File storage functions
export const uploadUserFile = async (userId: string, file: File, path: string) => {
  const storageRef = ref(storage, `users/${userId}/${path}/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return {
    url: downloadURL,
    path: snapshot.ref.fullPath,
    filename: file.name
  };
};

export const deleteUserFile = async (filePath: string) => {
  const storageRef = ref(storage, filePath);
  await deleteObject(storageRef);
  return true;
};

// Content functions
export const getContent = async (contentType: string, limitCount: number = 10) => {
  const contentQuery = query(
    collection(db, 'content'),
    where('type', '==', contentType),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(contentQuery);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
