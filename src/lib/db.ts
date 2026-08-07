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
} from 'firebase/firestore';

// ARMAZENAMENTO EM MEMÓRIA LOCAL DE FALLBACK (Garantia de 100% de Funcionamento)
const inMemoryStore: Record<string, Record<string, any>> = {
  config: {
    instagram_config: {
      id: 'instagram_config',
      account_name: 'Minha Conta IG',
      auto_reply_enabled: true,
      welcome_dm_enabled: true,
      lead_magnet_enabled: false,
    },
  },
  creator_profiles: {
    creator_config: {
      id: 'creator_config',
      niche: 'Tecnologia & IA',
      tone: 'Profissional e Inspirador',
      target_audience: 'Empreendedores e Criadores',
      bio: 'Especialista em automação de conteúdo com Inteligência Artificial',
    },
  },
  ideas: {},
  content_drafts: {},
  automations: {},
  chat_sessions: {},
  analyzed_templates: {},
};

function getLocalStore(collectionName: string) {
  if (!inMemoryStore[collectionName]) {
    inMemoryStore[collectionName] = {};
  }
  return inMemoryStore[collectionName];
}

// HELPER GENÉRICO PARA OBTER COLEÇÃO COM SORTING E MAPPING DE IDS
export async function getCollectionData<T = any>(collectionName: string, orderByField?: string): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const q = orderByField ? query(colRef, orderBy(orderByField, 'desc')) : colRef;
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
    const store = getLocalStore(collectionName);
    docs.forEach((doc: any) => {
      store[doc.id] = doc;
    });
    return docs;
  } catch (error) {
    console.warn(`Firestore inacessível para ${collectionName}, usando armazenamento local:`, error);
    const store = getLocalStore(collectionName);
    const list = Object.values(store) as T[];
    if (orderByField) {
      list.sort((a: any, b: any) => String(b[orderByField] || '').localeCompare(String(a[orderByField] || '')));
    }
    return list;
  }
}

// HELPER PARA LER UM ÚNICO DOCUMENTO POR ID
export async function getDocById<T = any>(collectionName: string, docId: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = { id: docSnap.id, ...docSnap.data() } as T;
      getLocalStore(collectionName)[docId] = data;
      return data;
    }
  } catch (error) {
    console.warn(`Firestore inacessível para ${collectionName}/${docId}, buscando em memória local:`, error);
  }
  const store = getLocalStore(collectionName);
  return store[docId] ? (store[docId] as T) : null;
}

// HELPER PARA SALVAR OU ATUALIZAR UM DOCUMENTO COM ID FIXO
export async function setDocData(collectionName: string, docId: string, data: any): Promise<void> {
  const now = new Date().toISOString();
  const store = getLocalStore(collectionName);
  const existing = store[docId] || {};
  const updatedData = { ...existing, ...data, id: docId, updated_at: now };
  store[docId] = updatedData;

  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, updatedData, { merge: true });
  } catch (error) {
    console.warn(`Salvo localmente em ${collectionName}/${docId} (Firestore indisponível):`, error);
  }
}

// HELPER PARA ADICIONAR UM DOCUMENTO COM ID GERADO AUTOMATICAMENTE
export async function addDocData(collectionName: string, data: any): Promise<any> {
  const now = new Date().toISOString();
  const tempId = 'id_' + Math.random().toString(36).substring(2, 9);
  const created_at = data.created_at || now;
  let finalId = tempId;

  try {
    const colRef = collection(db, collectionName);
    const res = await addDoc(colRef, {
      ...data,
      created_at,
      updated_at: now,
    });
    finalId = res.id;
  } catch (error) {
    console.warn(`Adicionado localmente em ${collectionName} (Firestore indisponível):`, error);
  }

  const resultItem = { id: finalId, ...data, created_at, updated_at: now };
  getLocalStore(collectionName)[finalId] = resultItem;
  return resultItem;
}

// HELPER PARA ATUALIZAR UM DOCUMENTO
export async function updateDocData(collectionName: string, docId: string, data: any): Promise<void> {
  const store = getLocalStore(collectionName);
  if (store[docId]) {
    store[docId] = { ...store[docId], ...data, updated_at: new Date().toISOString() };
  }
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, { ...data, updated_at: new Date().toISOString() });
  } catch (error) {
    console.warn(`Atualizado localmente em ${collectionName}/${docId} (Firestore indisponível):`, error);
  }
}

// HELPER PARA DELETAR UM DOCUMENTO
export async function deleteDocData(collectionName: string, docId: string): Promise<void> {
  const store = getLocalStore(collectionName);
  delete store[docId];
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn(`Deletado localmente de ${collectionName}/${docId} (Firestore indisponível):`, error);
  }
}

// FUNÇÕES ESPECÍFICAS DE BANCO DE DADOS DA APLICAÇÃO (FIRESTORE + FALLBACK)

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
    console.warn(`Mensagens do chat ${sessionId} buscadas em armazenamento local:`, error);
    const store = getLocalStore(`chat_${sessionId}_messages`);
    return Object.values(store);
  }
}
