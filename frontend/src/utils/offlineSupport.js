/**
 * ECONEURA - Offline Support & Service Worker
 * Enterprise-grade offline capabilities
 */

/**
 * Registrar Service Worker para soporte offline
 */
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('[SW] Service Worker registered:', registration);

          // Verificar actualizaciones cada 30 minutos
          setInterval(() => {
            registration.update();
          }, 30 * 60 * 1000);
        })
        .catch((error) => {
          console.error('[SW] Service Worker registration failed:', error);
        });
    });
  }
}

/**
 * Detectar si el usuario está offline
 */
export function isOffline() {
  return !navigator.onLine;
}

/**
 * Escuchar eventos de conexión
 */
export function setupConnectionListener(onOnline, onOffline) {
  window.addEventListener('online', () => {
    console.log('[Connection] Back online');
    if (onOnline) onOnline();
  });

  window.addEventListener('offline', () => {
    console.log('[Connection] Gone offline');
    if (onOffline) onOffline();
  });
}

/**
 * Guardar datos en localStorage con timestamp
 */
export function cacheData(key, data, ttl = 3600000) {
  // ttl por defecto: 1 hora
  try {
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error('[Cache] Error saving to localStorage:', error);
  }
}

/**
 * Recuperar datos de localStorage
 */
export function getCachedData(key) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const parsed = JSON.parse(item);
    const now = Date.now();

    // Verificar si los datos están expirados
    if (now - parsed.timestamp > parsed.ttl) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error('[Cache] Error reading from localStorage:', error);
    return null;
  }
}

/**
 * Limpiar caché expirado
 */
export function clearExpiredCache() {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach((key) => {
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (item && item.timestamp && item.ttl) {
          if (now - item.timestamp > item.ttl) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        // Ignorar items que no son JSON válido
      }
    });
  } catch (error) {
    console.error('[Cache] Error clearing expired cache:', error);
  }
}

/**
 * Queue para requests fallidos (para reintentar cuando vuelva la conexión)
 */
class RequestQueue {
  constructor() {
    this.queue = this.loadQueue();
  }

  loadQueue() {
    try {
      const stored = localStorage.getItem('econeura_request_queue');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[Queue] Error loading queue:', error);
      return [];
    }
  }

  saveQueue() {
    try {
      localStorage.setItem('econeura_request_queue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('[Queue] Error saving queue:', error);
    }
  }

  add(request) {
    this.queue.push({
      ...request,
      timestamp: Date.now(),
      retries: 0
    });
    this.saveQueue();
  }

  getAll() {
    return this.queue;
  }

  remove(index) {
    this.queue.splice(index, 1);
    this.saveQueue();
  }

  clear() {
    this.queue = [];
    this.saveQueue();
  }

  async processQueue(processFn) {
    if (isOffline()) {
      console.log('[Queue] Still offline, skipping queue processing');
      return;
    }

    console.log(`[Queue] Processing ${this.queue.length} queued requests`);
    const failedRequests = [];

    for (const request of this.queue) {
      try {
        await processFn(request);
        console.log('[Queue] Request processed successfully');
      } catch (error) {
        console.error('[Queue] Failed to process request:', error);
        request.retries++;
        
        // Si falló menos de 3 veces, mantener en la queue
        if (request.retries < 3) {
          failedRequests.push(request);
        } else {
          console.warn('[Queue] Request failed 3 times, removing from queue');
        }
      }
    }

    this.queue = failedRequests;
    this.saveQueue();
  }
}

export const requestQueue = new RequestQueue();

/**
 * Wrapper para fetch que soporta offline
 */
export async function fetchWithOfflineSupport(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    // Si estamos offline y es un GET, intentar obtener de caché
    if (isOffline() && (!options.method || options.method === 'GET')) {
      const cachedData = getCachedData(url);
      if (cachedData) {
        console.log('[Fetch] Using cached data for:', url);
        return {
          ok: true,
          status: 200,
          json: async () => cachedData,
          text: async () => JSON.stringify(cachedData),
          fromCache: true
        };
      }
    }
    
    // Si estamos offline y NO es un GET, agregar a la queue
    if (isOffline() && options.method && options.method !== 'GET') {
      console.log('[Fetch] Adding request to queue:', url);
      requestQueue.add({ url, options });
    }
    
    throw error;
  }
}

/**
 * Inicializar soporte offline
 */
export function initializeOfflineSupport() {
  // Registrar service worker
  registerServiceWorker();

  // Limpiar caché expirado al iniciar
  clearExpiredCache();

  // Configurar listeners de conexión
  setupConnectionListener(
    () => {
      // Al volver online, procesar queue
      console.log('[Offline] Back online, processing queued requests...');
      // Mostrar notificación al usuario
      showNotification('✅ Conexión restaurada', 'success');
      
      // Aquí podrías procesar la queue si tienes una función de procesamiento
      // requestQueue.processQueue(myProcessFunction);
    },
    () => {
      // Al perder conexión, notificar al usuario
      console.log('[Offline] Connection lost');
      showNotification('⚠️ Sin conexión', 'warning');
    }
  );

  console.log('[Offline] Offline support initialized');
}

/**
 * Mostrar notificación al usuario
 */
function showNotification(message, type = 'info') {
  // Implementación simple, puedes mejorarla con tu sistema de notificaciones
  console.log(`[Notification] [${type}] ${message}`);
  
  // Si tienes un sistema de toast/notification, úsalo aquí
  if (window.showToast) {
    window.showToast(message, type);
  }
}

export default {
  registerServiceWorker,
  isOffline,
  setupConnectionListener,
  cacheData,
  getCachedData,
  clearExpiredCache,
  requestQueue,
  fetchWithOfflineSupport,
  initializeOfflineSupport
};


