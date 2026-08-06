import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
} from 'firebase/firestore';

// HELPER GENÉRICO PARA OBTER COLEÇÃO COM SORTING E MAPPING DE IDS
export async function getCollectionData<T = any>(collectionName: string, orderByField?: string): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const q = orderByField ? query(colRef, orderBy(orderByField, 'desc')) : colRef;
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
  } catch (error) {
    console.error(`Erro ao buscar ${collectionName} do Firestore:`, error);
    return [];
  }
}

// HELPER PARA LER UM ÚNICO DOCUMENTO POR ID
export async function getDocById<T = any>(collectionName: string, docId: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error(`Erro ao obter doc ${docId} em ${collectionName}:`, error);
    return null;
  }
}

// HELPER PARA SALVAR OU ATUALIZAR UM DOCUMENTO COM ID FIXO
export async function setDocData(collectionName: string, docId: string, data: any): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await setDoc(docRef, { ...data, updated_at: new Date().toISOString() }, { merge: true });
}

// HELPER PARA ADICIONAR UM DOCUMENTO COM ID GERADO AUTOMATICAMENTE
export async function addDocData(collectionName: string, data: any): Promise<any> {
  const colRef = collection(db, collectionName);
  const now = new Date().toISOString();
  const res = await addDoc(colRef, {
    ...data,
    created_at: data.created_at || now,
    updated_at: now,
  });
  return { id: res.id, ...data, created_at: data.created_at || now, updated_at: now };
}

// HELPER PARA ATUALIZAR UM DOCUMENTO
export async function updateDocData(collectionName: string, docId: string, data: any): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, { ...data, updated_at: new Date().toISOString() });
}

// HELPER PARA DELETAR UM DOCUMENTO
export async function deleteDocData(collectionName: string, docId: string): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}

// FUNÇÕES ESPECÍFICAS DE BANCO DE DADOS DA APLICAÇÃO (FIRESTORE)

export async function getInstagramConfig() {
  return getDocById('config', 'instagram_config');
}

export async function getAutomations() {
  return getCollectionData('automations', 'created_at');
}

export async function getCreatorProfile() {
  return getDocById('creator_profiles', 'creator_config');
}

export async function getIdeas() {
  return getCollectionData('ideas', 'created_at');
}

export async function getDrafts() {
  return getCollectionData('content_drafts', 'updated_at');
}

export async function getChatSessions() {
  return getCollectionData('chat_sessions', 'updated_at');
}

export async function getTemplates() {
  return getCollectionData('analyzed_templates', 'created_at');
}

export async function getChatMessages(sessionId: string) {
  try {
    const colRef = collection(db, `chat_sessions/${sessionId}/messages`);
    const q = query(colRef, orderBy('created_at', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Erro ao buscar mensagens do chat:', error);
    return [];
  }
}
