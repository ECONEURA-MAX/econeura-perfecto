/**
 * ECONEURA - Internationalization
 * Sistema de traducciones multi-idioma
 */

export type Language = 'es' | 'en' | 'fr' | 'de';

export interface Translations {
  // Common
  common: {
    welcome: string;
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    search: string;
    filter: string;
    export: string;
    import: string;
  };

  // Auth
  auth: {
    login: string;
    logout: string;
    register: string;
    email: string;
    password: string;
    forgotPassword: string;
    rememberMe: string;
    noAccount: string;
    hasAccount: string;
    loginWith: string;
  };

  // Navigation
  nav: {
    dashboard: string;
    agents: string;
    library: string;
    analytics: string;
    settings: string;
    help: string;
  };

  // NEURAs
  neuras: {
    ceo: string;
    cto: string;
    cfo: string;
    cmo: string;
    chro: string;
    ciso: string;
    coo: string;
    cdo: string;
    cso: string;
    ia: string;
    cino: string;
  };

  // Actions
  actions: {
    execute: string;
    configure: string;
    view: string;
    download: string;
    upload: string;
    share: string;
    copy: string;
    paste: string;
  };

  // Messages
  messages: {
    executionSuccess: string;
    executionError: string;
    noData: string;
    dataLoaded: string;
    connectionLost: string;
    connectionRestored: string;
  };
}

export const translations: Record<Language, Translations> = {
  es: {
    common: {
      welcome: 'Bienvenido',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      close: 'Cerrar',
      search: 'Buscar',
      filter: 'Filtrar',
      export: 'Exportar',
      import: 'Importar'
    },
    auth: {
      login: 'Iniciar Sesión',
      logout: 'Cerrar Sesión',
      register: 'Registrarse',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      forgotPassword: '¿Olvidaste tu contraseña?',
      rememberMe: 'Mantener sesión iniciada',
      noAccount: '¿No tienes cuenta?',
      hasAccount: '¿Ya tienes cuenta?',
      loginWith: 'Iniciar sesión con'
    },
    nav: {
      dashboard: 'Inicio',
      agents: 'Agentes',
      library: 'Biblioteca',
      analytics: 'Análisis',
      settings: 'Configuración',
      help: 'Ayuda'
    },
    neuras: {
      ceo: 'Dirección Ejecutiva',
      cto: 'Tecnología',
      cfo: 'Finanzas',
      cmo: 'Marketing',
      chro: 'Recursos Humanos',
      ciso: 'Seguridad',
      coo: 'Operaciones',
      cdo: 'Datos y Legal',
      cso: 'Cadena de Suministro',
      ia: 'Inteligencia Artificial',
      cino: 'Innovación'
    },
    actions: {
      execute: 'Ejecutar',
      configure: 'Configurar',
      view: 'Ver',
      download: 'Descargar',
      upload: 'Subir',
      share: 'Compartir',
      copy: 'Copiar',
      paste: 'Pegar'
    },
    messages: {
      executionSuccess: 'Ejecución completada exitosamente',
      executionError: 'Error en la ejecución',
      noData: 'No hay datos disponibles',
      dataLoaded: 'Datos cargados correctamente',
      connectionLost: 'Conexión perdida',
      connectionRestored: 'Conexión restaurada'
    }
  },

  en: {
    common: {
      welcome: 'Welcome',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import'
    },
    auth: {
      login: 'Log In',
      logout: 'Log Out',
      register: 'Sign Up',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot password?',
      rememberMe: 'Remember me',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      loginWith: 'Log in with'
    },
    nav: {
      dashboard: 'Dashboard',
      agents: 'Agents',
      library: 'Library',
      analytics: 'Analytics',
      settings: 'Settings',
      help: 'Help'
    },
    neuras: {
      ceo: 'Executive Management',
      cto: 'Technology',
      cfo: 'Finance',
      cmo: 'Marketing',
      chro: 'Human Resources',
      ciso: 'Security',
      coo: 'Operations',
      cdo: 'Data & Legal',
      cso: 'Supply Chain',
      ia: 'Artificial Intelligence',
      cino: 'Innovation'
    },
    actions: {
      execute: 'Execute',
      configure: 'Configure',
      view: 'View',
      download: 'Download',
      upload: 'Upload',
      share: 'Share',
      copy: 'Copy',
      paste: 'Paste'
    },
    messages: {
      executionSuccess: 'Execution completed successfully',
      executionError: 'Execution error',
      noData: 'No data available',
      dataLoaded: 'Data loaded successfully',
      connectionLost: 'Connection lost',
      connectionRestored: 'Connection restored'
    }
  },

  fr: {
    common: {
      welcome: 'Bienvenue',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      close: 'Fermer',
      search: 'Rechercher',
      filter: 'Filtrer',
      export: 'Exporter',
      import: 'Importer'
    },
    auth: {
      login: 'Se Connecter',
      logout: 'Se Déconnecter',
      register: "S'inscrire",
      email: 'Email',
      password: 'Mot de passe',
      forgotPassword: 'Mot de passe oublié?',
      rememberMe: 'Se souvenir de moi',
      noAccount: "Pas de compte?",
      hasAccount: 'Déjà un compte?',
      loginWith: 'Se connecter avec'
    },
    nav: {
      dashboard: 'Tableau de bord',
      agents: 'Agents',
      library: 'Bibliothèque',
      analytics: 'Analytique',
      settings: 'Paramètres',
      help: 'Aide'
    },
    neuras: {
      ceo: 'Direction Exécutive',
      cto: 'Technologie',
      cfo: 'Finance',
      cmo: 'Marketing',
      chro: 'Ressources Humaines',
      ciso: 'Sécurité',
      coo: 'Opérations',
      cdo: 'Données et Juridique',
      cso: 'Chaîne logistique',
      ia: 'Intelligence Artificielle',
      cino: 'Innovation'
    },
    actions: {
      execute: 'Exécuter',
      configure: 'Configurer',
      view: 'Voir',
      download: 'Télécharger',
      upload: 'Téléverser',
      share: 'Partager',
      copy: 'Copier',
      paste: 'Coller'
    },
    messages: {
      executionSuccess: 'Exécution terminée avec succès',
      executionError: "Erreur d'exécution",
      noData: 'Aucune donnée disponible',
      dataLoaded: 'Données chargées avec succès',
      connectionLost: 'Connexion perdue',
      connectionRestored: 'Connexion rétablie'
    }
  },

  de: {
    common: {
      welcome: 'Willkommen',
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg',
      cancel: 'Abbrechen',
      confirm: 'Bestätigen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      close: 'Schließen',
      search: 'Suchen',
      filter: 'Filtern',
      export: 'Exportieren',
      import: 'Importieren'
    },
    auth: {
      login: 'Anmelden',
      logout: 'Abmelden',
      register: 'Registrieren',
      email: 'E-Mail',
      password: 'Passwort',
      forgotPassword: 'Passwort vergessen?',
      rememberMe: 'Angemeldet bleiben',
      noAccount: 'Noch kein Konto?',
      hasAccount: 'Bereits ein Konto?',
      loginWith: 'Anmelden mit'
    },
    nav: {
      dashboard: 'Dashboard',
      agents: 'Agenten',
      library: 'Bibliothek',
      analytics: 'Analytik',
      settings: 'Einstellungen',
      help: 'Hilfe'
    },
    neuras: {
      ceo: 'Geschäftsführung',
      cto: 'Technologie',
      cfo: 'Finanzen',
      cmo: 'Marketing',
      chro: 'Personalwesen',
      ciso: 'Sicherheit',
      coo: 'Betrieb',
      cdo: 'Daten und Recht',
      cso: 'Lieferkette',
      ia: 'Künstliche Intelligenz',
      cino: 'Innovation'
    },
    actions: {
      execute: 'Ausführen',
      configure: 'Konfigurieren',
      view: 'Ansehen',
      download: 'Herunterladen',
      upload: 'Hochladen',
      share: 'Teilen',
      copy: 'Kopieren',
      paste: 'Einfügen'
    },
    messages: {
      executionSuccess: 'Ausführung erfolgreich abgeschlossen',
      executionError: 'Ausführungsfehler',
      noData: 'Keine Daten verfügbar',
      dataLoaded: 'Daten erfolgreich geladen',
      connectionLost: 'Verbindung verloren',
      connectionRestored: 'Verbindung wiederhergestellt'
    }
  }
};

/**
 * Hook para usar traducciones
 */
export function useTranslations(lang: Language = 'es'): Translations {
  return translations[lang];
}

/**
 * Función helper para obtener traducción
 */
export function t(key: string, lang: Language = 'es'): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}

