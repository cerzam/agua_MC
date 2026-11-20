import { collection, doc, type CollectionReference, type DocumentReference, type Firestore } from 'firebase/firestore';

import { firestore, firebaseConfigError } from '@/config/firebase';

/** Punto único de acceso a Firestore: evita repetir validaciones en cada servicio. */
export function requireFirestore(): Firestore {
  if (!firestore) {
    throw new Error(firebaseConfigError ?? 'Firestore no está disponible.');
  }
  return firestore;
}

export function userCollection(uid: string, name: string): CollectionReference {
  return collection(requireFirestore(), 'users', uid, name);
}

export function userDoc(uid: string, collectionName: string, documentId: string): DocumentReference {
  return doc(requireFirestore(), 'users', uid, collectionName, documentId);
}

export function newId(collectionName: string): string {
  return doc(userCollection('__ids__', collectionName)).id;
}
