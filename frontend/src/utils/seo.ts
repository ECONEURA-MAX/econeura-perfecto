/**
 * Utilidades SEO para mejorar ranking
 */

interface MetaTagsConfig {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

/**
 * Actualizar meta tags dinámicamente
 */
export function updateMetaTags(config: MetaTagsConfig) {
  // Title
  if (config.title) {
    document.title = config.title;
  }

  // Description
  setMetaTag('description', config.description);
  setMetaTag('keywords', config.keywords);

  // Open Graph
  setMetaTag('og:title', config.ogTitle || config.title);
  setMetaTag('og:description', config.ogDescription || config.description);
  setMetaTag('og:image', config.ogImage);
  setMetaTag('og:url', config.ogUrl || window.location.href);
  setMetaTag('og:type', 'website');

  // Twitter
  setMetaTag('twitter:card', config.twitterCard || 'summary_large_image');
  setMetaTag('twitter:title', config.twitterTitle || config.title);
  setMetaTag('twitter:description', config.twitterDescription || config.description);
  setMetaTag('twitter:image', config.twitterImage || config.ogImage);
}

/**
 * Establecer o actualizar meta tag
 */
function setMetaTag(name: string, content?: string) {
  if (!content) return;

  const property = name.startsWith('og:') || name.startsWith('twitter:') ? 'property' : 'name';
  let meta = document.querySelector(`meta[${property}="${name}"]`);

  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(property, name);
    document.head.appendChild(meta);
  }

  meta.setAttribute('content', content);
}

/**
 * Generar JSON-LD para SEO estructurado
 */
export function generateOrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'ECONEURA',
    'url': 'https://econeura.com',
    'logo': 'https://econeura.com/logo-econeura.svg',
    'description': 'Ecosistema de Inteligencia Colectiva para PYMEs europeas',
    'foundingDate': '2025',
    'address': {
      '@type': 'PostalAddress',
      'addressCountry': 'ES'
    },
    'sameAs': [
      'https://github.com/ECONEURA-COM'
    ]
  };

  injectSchema(schema);
}

/**
 * Generar JSON-LD para WebApplication
 */
export function generateWebApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'ECONEURA Cockpit',
    'url': 'https://econeura.com',
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'EUR'
    },
    'browserRequirements': 'Requires JavaScript. Chrome, Firefox, Safari supported.',
    'permissions': 'No special permissions required'
  };

  injectSchema(schema);
}

/**
 * Inyectar schema JSON-LD en el DOM
 */
function injectSchema(schema: object) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/**
 * Configurar canonical URL
 */
export function setCanonicalUrl(url?: string) {
  const canonical = url || window.location.href.split('?')[0];
  
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  
  link.href = canonical;
}

/**
 * Preconnect a dominios externos para mejor performance
 */
export function addPreconnects(domains: string[]) {
  domains.forEach((domain) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/**
 * Configuración SEO por defecto para ECONEURA
 */
export function setupDefaultSEO() {
  updateMetaTags({
    title: 'ECONEURA - Ecosistema de Inteligencia Colectiva',
    description: 'Plataforma de gestión de agentes IA para PYMEs europeas. 10 NEURAs especializadas + 40 agentes Make.com integrados.',
    keywords: 'IA, agentes, automatización, PYMEs, Europa, productividad, Make.com',
    ogTitle: 'ECONEURA Cockpit',
    ogDescription: 'Gestiona tu equipo de agentes IA desde un solo lugar',
    ogImage: 'https://econeura.com/og-image.png',
    twitterCard: 'summary_large_image'
  });

  generateOrganizationSchema();
  generateWebApplicationSchema();
  setCanonicalUrl();
  
  // Preconnect a dominios críticos
  addPreconnects([
    'https://fonts.googleapis.com'
  ]);
}

