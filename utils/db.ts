
import { AppState } from '../types';

const DB_NAME = 'VibeFinanceDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_state_store';
const KEY = 'current_state';

const checkIndexedDBSupport = (): boolean => {
    return typeof window !== 'undefined' && 'indexedDB' in window;
};

const getDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (!checkIndexedDBSupport()) {
            reject(new Error('IndexedDB no está soportado en este navegador'));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
            console.error('Error al abrir IndexedDB:', request.error);
            reject(new Error(`No se pudo abrir la base de datos: ${request.error?.message || 'Error desconocido'}`));
        };
        
        request.onblocked = () => {
            console.warn('IndexedDB bloqueada. Cierre otras pestañas con esta aplicación abierta.');
            reject(new Error('Base de datos bloqueada por otra pestaña'));
        };
    });
};

export const saveStateToDB = async (state: AppState): Promise<void> => {
    try {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(state, KEY);

            request.onsuccess = () => resolve();
            request.onerror = () => {
                console.error('Error al guardar en IndexedDB:', request.error);
                reject(request.error);
            };
            
            transaction.onerror = () => {
                console.error('Error en la transacción de guardado:', transaction.error);
            };
        });
    } catch (error) {
        console.error('Error saving to IndexedDB:', error);
        // No lanzamos el error para no romper la app, solo logueamos
    }
};

export const loadStateFromDB = async (): Promise<AppState | undefined> => {
    try {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(KEY);

            request.onsuccess = () => {
                if (request.result === undefined) {
                    console.log('No se encontraron datos previos en IndexedDB');
                }
                resolve(request.result);
            };
            request.onerror = () => {
                console.error('Error al cargar desde IndexedDB:', request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('Error loading from IndexedDB:', error);
        return undefined;
    }
};
