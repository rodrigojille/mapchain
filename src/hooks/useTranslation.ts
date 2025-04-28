import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

// Define translation dictionaries
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.properties': 'Properties',
    'nav.valuators': 'Valuators',
    'nav.forecast': 'Forecast',
    'nav.map': 'Map',
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.admin': 'Admin',
    'nav.login': 'Log In',
    'nav.register': 'Register',
    'nav.logout': 'Log Out',
    
    // Footer
    'footer.description': 'MapChain is a blockchain-powered property valuation platform that provides both AI-powered quick valuations and certified professional valuations.',
    'footer.links': 'Quick Links',
    'footer.about': 'About Us',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.faq': 'FAQ',
    'footer.rights': 'All rights reserved.',
    
    // Theme
    'theme.light': 'Switch to light mode',
    'theme.dark': 'Switch to dark mode',
    
    // Home page
    'home.hero.title': 'Blockchain-Powered Property Valuation',
    'home.hero.subtitle': 'Get instant AI valuations or connect with certified professionals for official property valuations, all secured on the blockchain.',
    'home.hero.cta': 'Get Started',
    'home.hero.secondary': 'Learn More',
    'home.features.title': 'Why Choose MapChain',
    'home.features.ai.title': 'AI-Powered Valuations',
    'home.features.ai.description': 'Get instant property valuations powered by our advanced AI algorithms.',
    'home.features.professional.title': 'Certified Valuators',
    'home.features.professional.description': 'Connect with professional valuators for official property assessments.',
    'home.features.blockchain.title': 'Blockchain Security',
    'home.features.blockchain.description': 'All valuations are securely stored on the Hedera blockchain for transparency and immutability.',
    'home.features.forecast.title': 'Value Forecasting',
    'home.features.forecast.description': 'Predict future property values with our AI-powered forecasting tools.',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.properties': 'Your Properties',
    'dashboard.valuations': 'Valuation Requests',
    'dashboard.forecast': 'Property Value Forecast',
    
    // Property details
    'property.details': 'Property Details',
    'property.valuation': 'Valuation',
    'property.history': 'History',
    'property.map': 'Map',
    'property.blockchain': 'Blockchain',
    'property.request': 'Request Valuation',
    'property.tokenize': 'Tokenize Property',
    
    // Valuation
    'valuation.ai': 'AI Valuation',
    'valuation.official': 'Official Valuation',
    'valuation.factors': 'Valuation Factors',
    'valuation.confidence': 'Confidence Score',
    'valuation.download': 'Download PDF Report',
    'valuation.share': 'Share Valuation',
    'valuation.verify': 'Verify on Blockchain',
    
    // Forecast
    'forecast.title': 'Property Value Forecast',
    'forecast.timeframe': 'Timeframe',
    'forecast.factors': 'Forecast Factors',
    'forecast.current': 'Current Value',
    'forecast.projected': 'Projected Value',
    'forecast.trend': 'Overall Trend',
    
    // Valuator marketplace
    'valuators.title': 'Find a Professional Valuator',
    'valuators.filters': 'Filters',
    'valuators.search': 'Search',
    'valuators.specialization': 'Specialization',
    'valuators.rating': 'Minimum Rating',
    'valuators.fee': 'Maximum Fee',
    'valuators.available': 'Available valuators only',
    'valuators.sort': 'Sort By',
    'valuators.profile': 'View Profile',
    
    // Auth
    'auth.login.title': 'Welcome to MapChain',
    'auth.login.subtitle': 'Sign in to access property valuations, connect with professional valuators, and more',
    'auth.register.title': 'Join MapChain',
    'auth.register.subtitle': 'Create an account to access property valuations, connect with professional valuators, and track property values on the blockchain',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.name': 'Full Name',
    'auth.role': 'I am registering as a',
    'auth.propertyOwner': 'Property Owner',
    'auth.valuator': 'Professional Valuator',
    'auth.submit': 'Sign In',
    'auth.register': 'Create Account',
    'auth.forgotPassword': 'Forgot password?',
    'auth.haveAccount': 'Already have an account?',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.wallet': 'Connect with Hedera Wallet',
    
    // PDF Report
    'pdf.title': 'Property Valuation Report',
    'pdf.official': 'Official Property Valuation',
    'pdf.date': 'Valuation Date',
    'pdf.property': 'Property Details',
    'pdf.value': 'Valuation Amount',
    'pdf.valuator': 'Certified Valuator',
    'pdf.blockchain': 'Blockchain Verification',
    'pdf.disclaimer': 'This valuation report is secured on the Hedera blockchain and can be verified using the token ID provided above.',
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.properties': 'Propiedades',
    'nav.valuators': 'Tasadores',
    'nav.forecast': 'Pronóstico',
    'nav.map': 'Mapa',
    'nav.dashboard': 'Panel',
    'nav.profile': 'Perfil',
    'nav.settings': 'Configuración',
    'nav.admin': 'Administrador',
    'nav.login': 'Iniciar Sesión',
    'nav.register': 'Registrarse',
    'nav.logout': 'Cerrar Sesión',
    
    // Footer
    'footer.description': 'MapChain es una plataforma de valoración de propiedades basada en blockchain que proporciona valoraciones rápidas impulsadas por IA y valoraciones profesionales certificadas.',
    'footer.links': 'Enlaces Rápidos',
    'footer.about': 'Sobre Nosotros',
    'footer.contact': 'Contacto',
    'footer.privacy': 'Política de Privacidad',
    'footer.terms': 'Términos de Servicio',
    'footer.faq': 'Preguntas Frecuentes',
    'footer.rights': 'Todos los derechos reservados.',
    
    // Theme
    'theme.light': 'Cambiar a modo claro',
    'theme.dark': 'Cambiar a modo oscuro',
    
    // Home page
    'home.hero.title': 'Valoración de Propiedades con Blockchain',
    'home.hero.subtitle': 'Obtenga valoraciones instantáneas de IA o conéctese con profesionales certificados para valoraciones oficiales de propiedades, todo asegurado en blockchain.',
    'home.hero.cta': 'Comenzar',
    'home.hero.secondary': 'Más Información',
    'home.features.title': 'Por Qué Elegir MapChain',
    'home.features.ai.title': 'Valoraciones con IA',
    'home.features.ai.description': 'Obtenga valoraciones instantáneas de propiedades impulsadas por nuestros avanzados algoritmos de IA.',
    'home.features.professional.title': 'Tasadores Certificados',
    'home.features.professional.description': 'Conéctese con tasadores profesionales para evaluaciones oficiales de propiedades.',
    'home.features.blockchain.title': 'Seguridad Blockchain',
    'home.features.blockchain.description': 'Todas las valoraciones se almacenan de forma segura en la blockchain Hedera para garantizar transparencia e inmutabilidad.',
    'home.features.forecast.title': 'Pronóstico de Valor',
    'home.features.forecast.description': 'Prediga valores futuros de propiedades con nuestras herramientas de pronóstico impulsadas por IA.',
    
    // Dashboard
    'dashboard.welcome': 'Bienvenido de nuevo',
    'dashboard.properties': 'Sus Propiedades',
    'dashboard.valuations': 'Solicitudes de Valoración',
    'dashboard.forecast': 'Pronóstico de Valor de Propiedad',
    
    // Property details
    'property.details': 'Detalles de la Propiedad',
    'property.valuation': 'Valoración',
    'property.history': 'Historial',
    'property.map': 'Mapa',
    'property.blockchain': 'Blockchain',
    'property.request': 'Solicitar Valoración',
    'property.tokenize': 'Tokenizar Propiedad',
    
    // Valuation
    'valuation.ai': 'Valoración de IA',
    'valuation.official': 'Valoración Oficial',
    'valuation.factors': 'Factores de Valoración',
    'valuation.confidence': 'Puntuación de Confianza',
    'valuation.download': 'Descargar Informe PDF',
    'valuation.share': 'Compartir Valoración',
    'valuation.verify': 'Verificar en Blockchain',
    
    // Forecast
    'forecast.title': 'Pronóstico de Valor de Propiedad',
    'forecast.timeframe': 'Período de Tiempo',
    'forecast.factors': 'Factores de Pronóstico',
    'forecast.current': 'Valor Actual',
    'forecast.projected': 'Valor Proyectado',
    'forecast.trend': 'Tendencia General',
    
    // Valuator marketplace
    'valuators.title': 'Encontrar un Tasador Profesional',
    'valuators.filters': 'Filtros',
    'valuators.search': 'Buscar',
    'valuators.specialization': 'Especialización',
    'valuators.rating': 'Calificación Mínima',
    'valuators.fee': 'Tarifa Máxima',
    'valuators.available': 'Solo tasadores disponibles',
    'valuators.sort': 'Ordenar Por',
    'valuators.profile': 'Ver Perfil',
    
    // Auth
    'auth.login.title': 'Bienvenido a MapChain',
    'auth.login.subtitle': 'Inicie sesión para acceder a valoraciones de propiedades, conectarse con tasadores profesionales y más',
    'auth.register.title': 'Únase a MapChain',
    'auth.register.subtitle': 'Cree una cuenta para acceder a valoraciones de propiedades, conectarse con tasadores profesionales y seguir valores de propiedades en blockchain',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.confirmPassword': 'Confirmar Contraseña',
    'auth.name': 'Nombre Completo',
    'auth.role': 'Me estoy registrando como',
    'auth.propertyOwner': 'Propietario',
    'auth.valuator': 'Tasador Profesional',
    'auth.submit': 'Iniciar Sesión',
    'auth.register': 'Crear Cuenta',
    'auth.forgotPassword': '¿Olvidó su contraseña?',
    'auth.haveAccount': '¿Ya tiene una cuenta?',
    'auth.noAccount': '¿No tiene una cuenta?',
    'auth.wallet': 'Conectar con Billetera Hedera',
    
    // PDF Report
    'pdf.title': 'Informe de Valoración de Propiedad',
    'pdf.official': 'Valoración Oficial de Propiedad',
    'pdf.date': 'Fecha de Valoración',
    'pdf.property': 'Detalles de la Propiedad',
    'pdf.value': 'Monto de Valoración',
    'pdf.valuator': 'Tasador Certificado',
    'pdf.blockchain': 'Verificación Blockchain',
    'pdf.disclaimer': 'Este informe de valoración está asegurado en la blockchain Hedera y puede verificarse utilizando el ID de token proporcionado anteriormente.',
  }
};

export function useTranslation() {
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  
  // Initialize language based on URL path or browser language
  useEffect(() => {
    const path = router.asPath;
    if (path.startsWith('/es')) {
      setLanguage('es');
    } else {
      // Check browser language as fallback
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'es') {
        setLanguage('es');
      }
    }
  }, [router.asPath]);
  
  // Translation function
  const t = useCallback((key: string): string => {
    return translations[language][key] || key;
  }, [language]);
  
  // Change language function
  const changeLanguage = useCallback((newLang: string) => {
    if (newLang !== language && (newLang === 'en' || newLang === 'es')) {
      setLanguage(newLang as 'en' | 'es');
      
      // Update URL to reflect language change
      const currentPath = router.asPath;
      const newPath = newLang === 'en' 
        ? currentPath.replace(/^\/es/, '') 
        : currentPath.startsWith('/es') 
          ? currentPath 
          : `/es${currentPath}`;
      
      router.push(newPath, undefined, { shallow: true });
    }
  }, [language, router]);
  
  return { t, language, changeLanguage };
}
