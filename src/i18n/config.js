import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
const INTERFACE_LANGUAGE_KEYS = {
  public: 'vetlife_public_lang',
  admin: 'vetlife_admin_lang',
};

export const getInterfaceLanguageContext = (pathname = window.location.pathname) =>
  pathname.startsWith('/clinic/') ? 'admin' : 'public';

export const getInterfaceLanguageKey = (context = getInterfaceLanguageContext()) =>
  INTERFACE_LANGUAGE_KEYS[context];

export const getStoredInterfaceLanguage = (context = getInterfaceLanguageContext()) =>
  localStorage.getItem(getInterfaceLanguageKey(context)) || 'ar';

const resources = {
  ar: {
    translation: {
      // Navbar & Global Links
      navHome: "الرئيسية",
      navAbout: "من نحن",
      navServices: "خدماتنا",
      navFaq: "الأسئلة الشائعة",
      navContact: "تواصل معنا",

      // Hero Section
      heroBadge: "🐾 رعاية بيطرية متكاملة لحيوانك الأليف",
      heroWelcome: "مرحباً بك في عيادة",
      heroModern: "الحديثة",
      heroDescription: "نحن هنا لتقديم أفضل الخدمات الطبية والرعاية الصحية الشاملة لحيواناتكم الأليفة بأحدث التقنيات وبأيدي أطباء متخصصين يحبون ما يفعلون.",
      heroBtnBook: "احجز موعداً الآن",
      heroBtnDiscover: "اكتشف خدماتنا",

      // Services Section
      servicesTitle: "الخدمات الطبية التي نقدمها",
      servicesSubtitle: "نوفر لحيوانك الأليف عيادة شاملة تغطّي كافة احتياجاته الصحية والوقائية تحت سقف واحد.",
      service1Title: "الفحص الطبي العام",
      service1Desc: "تشخيص دقيق، فحوصات دورية شاملة، ومتابعة دقيقة للحالة الصحية والنمو.",
      service2Title: "التطعيمات والوقاية",
      service2Desc: "برامج تحصين متكاملة ضد الأمراض المعدية لحماية حيوانك في كافة أطواره العمرية.",
      service3Title: "العناية والنظافة",
      service3Desc: "قص الشعر، تقليم الأظافر، والتنظيف الصحي للحفاظ على مظهر لائق ونظيف دائماً.",
      service4Title: "الجراحة والتحاليل",
      service4Desc: "غرفة عمليات مجهزة بالكامل مع تحاليل مخبرية فورية لضمان سلامة حيوانك الأليف.",

      // About Section
      aboutBadge: "من نحن",
      aboutTitle: "نكرّس جهودنا لتقديم تجربة رعاية صحية ودية ومريحة",
      aboutDescStart: "في عيادة",
      aboutDescEnd: "نؤمن بأن الحيوانات الأليفة هي أفراد من العائلة. لذلك، نسعى جاهدين لتوفير أعلى مستويات الرعاية الطبية والوقائية بشغف وأمانة، معتمدين على أحدث الأجهزة الطبيّة لضمان سلامة أصدقائكم الأوفياء.",
      aboutQuote: "\"رعايتنا لا تقتصر على العلاج فقط، بل نمنحهم الحب والاهتمام الذي يستحقونه.\"",
      feature1Title: "طوارئ 24/7",
      feature1Desc: "مستعدون استقبال الحالات الحرجة في أي وقت.",
      feature2Title: "أطباء خبراء",
      feature2Desc: "طاقم طبي متخصص ذو خبرة وكفاءة عالية.",
      feature3Title: "أحدث التقنيات",
      feature3Desc: "أجهزة فحص وتحاليل مخبرية متطورة وفورية.",
      feature4Title: "بيئة مريحة",
      feature4Desc: "أجواء هادئة ومخصصة لتقليل توتر الحيوانات.",

      // FAQ Section
      faqSectionTitle: "لديك استفسار؟ تجد إجابته هنا",
      faq1Q: "ما هي مواعيد العمل الرسمية في العيادة؟",
      faq1A: "نحن متواجدون لخدمتكم يومياً من الساعة 9 صباحاً وحتى 9 مساءً، بالإضافة إلى تقديم خدمة الطوارئ للحالات الحرجة على مدار 24 ساعة طوال أيام الأسبوع.",
      faq2Q: "هل يجب عليّ حجز موعد مسبق قبل الحضور؟",
      faq2A: "يفضل دائماً حجز موعد مسبق عبر الموقع أو الهاتف لضمان عدم الانتظار وتوفير أفضل رعاية لحيوانك، لكننا نستقبل الحالات الطارئة والمستعجلة فوراً دون موعد.",
      faq3Q: "ما هي أنواع الحيوانات التي تستقبلها العيادة؟",
      faq3A: "نستقبل ونقدم الرعاية الطبية الشاملة لمختلف الحيوانات الأليفة بما في ذلك القطط، الكلاب، الطيور، والأرانب وغيرها من الحيوانات المنزلية الصغيرة.",
      faq4Q: "هل توفر العيادة خدمات التطعيم والشهادات الصحية للسفر؟",
      faq4A: "نعم، نوفر جميع أنواع التطعيمات الأساسية والدورية، ونقوم بإصدار دفاتر التطعيم المعتمدة والشهادات الصحية اللازمة لإجراءات سفر الحيوانات الأليفة.",

      // Footer
      footerAboutText: "عيادتنا متخصصة في تقديم الرعاية الطبية الشاملة والوقائية لكافة أنواع الحيوانات الأليفة بأحدث التقنيات وأفضل الأطباء.",
      footerLinksTitle: "روابط سريعة",
      footerContactTitle: "اتصل بنا",
      footerCity: "عنابة، الجزائر",
      footerCopyright: "عيادة VetLife. جميع الحقوق محفوظة.",
      footerDevelopedBy: "تم التطوير بكل ❤️ بواسطة عبد الجليل خلفة",



       bookingTitle: "احجز موعداً لحيوانك الأليف",
       bookingSubtitle: "املأ الاستمارة أدناه لتأكيد موعدك في العيادة خلال ثوانٍ.",
       labelPetName: "اسم الحيوان الأليف",
       labelPetType: "نوع الحيوان",
       labelService: "الخدمة المطلوبة",
       labelDate: "تاريخ الموعد",
       phPetName: "مثال: ريكسي، لوسي...",
       optSelectType: "اختر النوع",
       optCat: "قطة 🐱",
       optDog: "كلب 🐶",
       optBird: "طائر 🐦",
       optOther: "أخرى",
       optSelectService: "اختر الخدمة",
       btnSubmitBooking: "تأكيد الحجز الفوري ✨",
      successMessage: "تم تسجيل موعدك بنجاح! سنكون في انتظاركم 💚",



tipsTitle: "إرشادات ونصائح بيطرية غالية",
tipsSubtitle: "دليلك السريع لنصائح يومية تضمن بها صحة، حيوية، وسعادة أصدقائك الصغار.",
tip1Title: "أهمية شرب الماء في الصيف 💧",
tip1Desc: "تأكد من توفير مياه نظيفة وباردة طوال الوقت لتجنب الضربات الحرارية الخطيرة لحيوانك.",
tip2Title: "تنظيم الوجبات بحسم 🍖",
tip2Desc: "تجنب الأطعمة البشرية كالشوكولاتة والبصل لأنها سامة جداً، والتزم بجرعات الطعام المحددة.",
tip3Title: "الفحص الذاتي الدوري 🔍",
tip3Desc: "تفقد فروة أليفك وعينيه بشكل أسبوعي لاكتشاف أي طفيليات أو التهابات مبكرة والتعامل معها.",

filterAll: "الكل",
optGeneral: "نصائح عامة",
bookingSubtitle: "يرجى ملء النموذج أدناه لتأمين موعد أليفك على الفور.",
successMessage: "تم إرسال طلب حجز الموعد بنجاح!",
adminTitle: "لوحة تحكم الإدارة",
thPetName: "اسم الأليف",
thPetType: "النوع",
thService: "الخدمة",
thDate: "التاريخ"
    }
  },
  en: {
    translation: {
      navHome: "Home",
      navAbout: "About",
      navServices: "Services",
      navFaq: "FAQ",
      navContact: "Contact Us",
      heroBadge: "🐾 Comprehensive veterinary care for your pet",
      heroWelcome: "Welcome to the modern",
      heroModern: "Clinic",
      heroDescription: "We are here to provide the best medical services and comprehensive health care for your pets with the latest technologies and by specialized doctors who love what they do.",
      heroBtnBook: "Book Appointment",
      heroBtnDiscover: "Discover Our Services",
      servicesTitle: "Medical Services We Provide",
      servicesSubtitle: "We provide your pet with a comprehensive clinic covering all health and preventive needs under one roof.",
      service1Title: "General Checkup",
      service1Desc: "Accurate diagnosis, comprehensive periodic examinations, and close monitoring of health and growth.",
      service2Title: "Vaccinations & Prevention",
      service2Desc: "Integrated immunization programs against infectious diseases to protect your pet at all stages of life.",
      service3Title: "Grooming & Hygiene",
      service3Desc: "Haircutting, nail trimming, and hygienic cleaning to maintain a neat and clean appearance always.",
      service4Title: "Surgery & Analysis",
      service4Desc: "Fully equipped operating room with immediate laboratory analysis to ensure the safety of your pet.",
      aboutBadge: "About Us",
      aboutTitle: "We dedicate our efforts to provide a friendly and comfortable care experience",
      aboutDescStart: "At",
      aboutDescEnd: "we believe that pets are family members. Therefore, we strive to provide the highest levels of medical and preventive care with passion and honesty, relying on the latest medical devices to ensure the safety of your loyal friends.",
      aboutQuote: "\"Our care is not limited to treatment only, we give them the love and attention they deserve.\"",
      feature1Title: "24/7 Emergency",
      feature1Desc: "Ready to receive critical cases at any time.",
      feature2Title: "Expert Doctors",
      feature2Desc: "Specialized medical staff with high experience and efficiency.",
      feature3Title: "Latest Tech",
      feature3Desc: "Advanced and immediate examination devices and laboratory analysis.",
      feature4Title: "Cozy Environment",
      feature4Desc: "Calm atmosphere dedicated to reducing pet stress.",
      faqSectionTitle: "Have a question? Find the answer here",
      faq1Q: "What are the official working hours at the clinic?",
      faq1A: "We are available to serve you daily from 9 AM to 9 PM, in addition to providing emergency service for critical cases 24/7.",
      faq2Q: "Should I book an appointment in advance before coming?",
      faq2A: "It is always preferred to book an appointment via the website or phone to ensure no waiting, but we receive emergency cases immediately without an appointment.",
      faq3Q: "What types of animals does the clinic receive?",
      faq3A: "We receive and provide comprehensive medical care for various pets including cats, dogs, birds, rabbits and other small domestic animals.",
      faq4Q: "Does the clinic provide vaccination services and health certificates for travel?",
      faq4A: "Yes, we provide all types of basic and periodic vaccinations, and we issue approved vaccination booklets and health certificates necessary for pet travel procedures.",
      footerAboutText: "Our clinic specializes in providing comprehensive and preventive medical care for all types of pets with the latest technologies and best doctors.",
      footerLinksTitle: "Quick Links",
      footerContactTitle: "Contact Us",
      footerCity: "Annaba, Algeria",
      footerCopyright: "VetLife Clinic. All rights reserved.",
      footerDevelopedBy: "Developed with ❤️ by Abdeljalil Khelfa",
   



      bookingTitle: "Book an Appointment for Your Pet",
bookingSubtitle: "Fill out the form below to confirm your clinic appointment in seconds.",
labelPetName: "Pet Name",
labelPetType: "Pet Type",
labelService: "Required Service",
labelDate: "Appointment Date",
phPetName: "e.g., Rex, Lucy...",
optSelectType: "Select Type",
optCat: "Cat 🐱",
optDog: "Dog 🐶",
optBird: "Bird 🐦",
optOther: "Other",
optSelectService: "Select Service",
btnSubmitBooking: "Confirm Appointment ✨",
successMessage: "Your appointment has been successfully booked! We look forward to seeing you 💚",


tipsTitle: "Valuable Veterinary Tips",
tipsSubtitle: "Your quick daily guide to ensuring the health, vitality, and happiness of your little friends.",
tip1Title: "Hydration in Summer 💧",
tip1Desc: "Always provide clean, fresh water to prevent dangerous heatstrokes for your pet.",
tip2Title: "Strict Diet Control 🍖",
tip2Desc: "Avoid human foods like chocolate and onions as they are highly toxic; stick to designated pet portions.",
tip3Title: "Routine Self-Checks 🔍",
tip3Desc: "Check your pet's fur and eyes weekly to catch parasites or early infections quickly.",

filterAll: "All",
optGeneral: "General Advice",
bookingSubtitle: "Fill out the form below to secure your pet's appointment instantly.",
successMessage: "Your appointment request has been submitted successfully!",
adminTitle: "Admin Dashboard",
thPetName: "Pet Name",
thPetType: "Type",
thService: "Service",
thDate: "Date"
    }
},
  fr: {
    translation: {
      navHome: "Accueil",
      navAbout: "À propos",
      navServices: "Services",
      navFaq: "FAQ",
      navContact: "Contactez-nous",
      heroBadge: "🐾 Des soins vétérinaires complets pour votre animal",
      heroWelcome: "Bienvenue à la clinique moderne",
      heroModern: "",
      heroDescription: "Nous sommes là pour fournir les meilleurs services médicaux et des soins de santé complets pour vos animaux de compagnie avec les dernières technologies et par des médecins spécialisés qui aiment ce qu'ils font.",
      heroBtnBook: "Prendre RDV",
      heroBtnDiscover: "Découvrir nos services",
      servicesTitle: "Services médicaux que nous fournissons",
      servicesSubtitle: "Nous offrons à votre animal une clinique complète couvrant tous ses besoins de santé et de prévention sous un même toit.",
      service1Title: "Examen médical général",
      service1Desc: "Diagnostic précis, examens périodiques complets et suivi attentif de la santé et de la croissance.",
      service2Title: "Vaccinations et prévention",
      service2Desc: "Programmes d'immunisation intégrés contre les maladies infectieuses pour protéger votre animal à tous les stades de sa vie.",
      service3Title: "Toilettage et hygiène",
      service3Desc: "Coupe de cheveux, coupe des ongles et nettoyage hygiénique pour maintenir une apparence soignée et propre toujours.",
      service4Title: "Chirurgie et analyses",
      service4Desc: "Salle d'opération entièrement équipée avec analyse en laboratoire immédiate pour assurer la sécurité de votre animal.",
      aboutBadge: "À propos de nous",
      aboutTitle: "Nous consacrons nos efforts à fournir une expérience de soins amicale et confortable",
      aboutDescStart: "À la clinique",
      aboutDescEnd: "nous croyons que les animaux de compagnie sont des membres de la famille. Par conséquent, nous nous efforçons de fournir les plus hauts niveaux de soins médicaux et préventifs avec passion et honnêteté.",
      aboutQuote: "\"Nos soins ne se limitent pas au traitement, nous leur donnons l'amour et l'attention qu'ils méritent.\"",
      feature1Title: "Urgence 24/7",
      feature1Desc: "Prêt à recevoir les cas critiques à tout moment.",
      feature2Title: "Médecins experts",
      feature2Desc: "Personnel médical spécialisé disposant d'une grande expérience et efficacité.",
      feature3Title: "Dernière technologie",
      feature3Desc: "Dispositifs d'examen avancés et analyses de laboratoire immédiates.",
      feature4Title: "Environnement confortable",
      feature4Desc: "Atmosphère calme dédiée à la réduction du stress des animaux.",
      faqSectionTitle: "Vous avez une question? Trouvez la réponse ici",
      faq1Q: "Quels sont les horaires officiels de la clinique?",
      faq1A: "Nous sommes à votre service tous les jours de 9h00 à 21h00, en plus de fournir un service d'urgence pour les cas critiques 24h/24 et 7j/7.",
      faq2Q: "Dois-je réserver un rendez-vous à l'avance avant de venir?",
      faq2A: "Il est toujours préférable de réserver un rendez-vous via le site ou par téléphone, mais nous recevons les cas d'urgence immédiatement sans rendez-vous.",
      faq3Q: "Quels types d'animaux la clinique reçoit-elle?",
      faq3A: "Nous recevons et fournissons des soins médicaux complets pour divers animaux de compagnie, notamment les chats, les chiens, les oiseaux, les lapins, etc.",
      faq4Q: "La clinique fournit-elle des services de vaccination et des certificats de santé pour les voyages?",
      faq4A: "Oui, nous fournissons tous les types de vaccinations de base et périodiques, et nous délivrons les carnets de vaccination approuvés et les certificats de santé nécessaires.",
      footerAboutText: "Notre clinique est spécialisée dans la fournision de soins médicaux complets et préventifs pour tous les types d'animaux de compagnie avec les meilleures technologies.",
footerLinksTitle: "Liens rapides",
      footerContactTitle: "Contactez-nous",
      footerCity: "Annaba, Algérie",
      footerCopyright: "Clinique VetLife. Tous droits réservés.",
      footerDevelopedBy: "Développé avec ❤️ par Abdeljalil Khelfa",
  
  bookingTitle: "Prendre RDV pour votre animal",
bookingSubtitle: "Remplissez le formulaire ci-dessous pour confirmer votre rendez-vous en quelques secondes.",
labelPetName: "Nom de l'animal",
labelPetType: "Type d'animal",
labelService: "Service requis",
labelDate: "Date du rendez-vous",
phPetName: "ex: Rex, Lucy...",
optSelectType: "Choisir le type",
optCat: "Chat 🐱",
optDog: "Chien 🐶",
optBird: "Oiseau 🐦",
optOther: "Autre",
optSelectService: "Choisir le service",
btnSubmitBooking: "Confirmer le RDV ✨",
successMessage: "Votre rendez-vous a été enregistré avec succès! Nous vous attendons 💚",


tipsTitle: "Conseils Vétérinaires Précieux",
tipsSubtitle: "Votre guide quotidien rapide pour assurer la santé, la vitalité et le bonheur de vos petits compagnons.",
tip1Title: "L'importance de l'eau en été 💧",
tip1Desc: "Assurez-vous de fournir de l'eau fraîche et propre en permanence pour éviter les coups de chaleur.",
tip2Title: "Contrôle strict des repas 🍖",
tip2Desc: "Évitez les aliments humains comme le chocolat et l'oignon qui sont toxiques; respectez les portions.",
tip3Title: "Contrôle hebdomadaire 🔍",
tip3Desc: "Inspectez le pelage et les yeux de votre animal chaque semaine pour détecter les parasites précocement.",

btnSubmitBooking: "Confirmer la Réservation",
      filterAll: "Tout",
      optGeneral: "Conseils Généraux",
      successMessage: "Votre demande de rendez-vous a été envoyée avec succès !",
      adminTitle: "Tableau de Bord Administration",
thPetName: "Nom de l'animal",
thPetType: "Type",
thService: "Service",
thDate: "Date"
  
    }
  }
};


// --- TRANSLATION CORE ENGINE ---
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getStoredInterfaceLanguage(),
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    }
  });

// Automatically sync document language and direction when language changes dynamically
i18n.on('languageChanged', (lng) => {
  const context = getInterfaceLanguageContext();
  localStorage.setItem(getInterfaceLanguageKey(context), lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = lng.startsWith('ar') ? 'rtl' : 'ltr';
});

// Initial boot synchronization for the active interface's language and direction.
const currentLang = getStoredInterfaceLanguage();
document.documentElement.lang = currentLang;
document.documentElement.dir = currentLang.startsWith('ar') ? 'rtl' : 'ltr';


// --- PERSISTENT DARK MODE SYSTEM ---
const THEME_KEY = 'vet-theme';

/**
 * Checks the initial theme setup from localStorage or system preference
 * @returns {boolean} True if dark mode is active
 */
export const getInitialTheme = () => {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) return savedTheme === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/**
 * Synchronizes the theme state directly with the document root element
 * @param {boolean} isDark 
 */
export const syncThemeWithDOM = (isDark) => {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
    localStorage.setItem(THEME_KEY, 'dark');
  } else {
    root.classList.remove('dark');
    localStorage.setItem(THEME_KEY, 'light');
  }
};

/**
 * Toggles the theme globally and forces a layout repaint
 */
export const toggleThemeGlobal = () => {
  const isCurrentlyDark = localStorage.getItem(THEME_KEY) === 'dark';
  syncThemeWithDOM(!isCurrentlyDark);
};

// --- RUN SYSTEM OPERATIONS ON BOOT ---
// Instantly safe-guard the UI style before browser layout paint to prevent white flashbangs
syncThemeWithDOM(getInitialTheme());

export default i18n;