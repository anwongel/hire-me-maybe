import { db } from './firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';

const applicationsCol = collection(db, 'applications');

export const addApplication = async (data, userId) => {
  return await addDoc(applicationsCol, {
    ...data,
    userId,
    createdAt: new Date().toISOString()
  });
};

export const getApplications = async (userId) => {
  const q = query(applicationsCol, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};