import i18n from './config'

const translations = {
  ar: {
    language: 'اللغة',
    authLoginTitle: 'تسجيل دخول العيادة',
    authLoginHint: 'استخدم حساب Firebase Authentication المخصص لهذه العيادة.',
    authEmail: 'البريد الإلكتروني',
    authPassword: 'كلمة المرور',
    authSigningIn: 'جارٍ تسجيل الدخول…',
    authSignIn: 'تسجيل الدخول',
    authInvalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    authTooManyRequests: 'عدد محاولات تسجيل الدخول كبير. حاول مرة أخرى لاحقاً.',
    authNetworkError: 'تعذر تسجيل الدخول بسبب مشكلة في الشبكة. تحقق من الاتصال وحاول مرة أخرى.',
    authSignInFailed: 'فشل تسجيل الدخول. حاول مرة أخرى.',
    adminNavigation: 'التنقل في لوحة العيادة',
    day_monday: 'الاثنين', day_tuesday: 'الثلاثاء', day_wednesday: 'الأربعاء', day_thursday: 'الخميس', day_friday: 'الجمعة', day_saturday: 'السبت', day_sunday: 'الأحد',
  },
  en: {
    language: 'Language',
    authLoginTitle: 'Clinic sign in',
    authLoginHint: 'Use the Firebase Authentication account assigned to this clinic.',
    authEmail: 'Email',
    authPassword: 'Password',
    authSigningIn: 'Signing in…',
    authSignIn: 'Sign in',
    authInvalidCredentials: 'The email or password is incorrect.',
    authTooManyRequests: 'Too many sign-in attempts. Please try again later.',
    authNetworkError: 'A network error prevented sign-in. Check your connection and try again.',
    authSignInFailed: 'Sign-in failed. Please try again.',
    adminNavigation: 'Clinic navigation',
    day_monday: 'Monday', day_tuesday: 'Tuesday', day_wednesday: 'Wednesday', day_thursday: 'Thursday', day_friday: 'Friday', day_saturday: 'Saturday', day_sunday: 'Sunday',
  },
  fr: {
    language: 'Langue',
    authLoginTitle: 'Connexion à la clinique',
    authLoginHint: 'Utilisez le compte Firebase Authentication attribué à cette clinique.',
    authEmail: 'E-mail',
    authPassword: 'Mot de passe',
    authSigningIn: 'Connexion…',
    authSignIn: 'Se connecter',
    authInvalidCredentials: 'L’e-mail ou le mot de passe est incorrect.',
    authTooManyRequests: 'Trop de tentatives de connexion. Réessayez plus tard.',
    authNetworkError: 'Un problème réseau a empêché la connexion. Vérifiez votre connexion puis réessayez.',
    authSignInFailed: 'La connexion a échoué. Réessayez.',
    adminNavigation: 'Navigation de la clinique',
    day_monday: 'Lundi', day_tuesday: 'Mardi', day_wednesday: 'Mercredi', day_thursday: 'Jeudi', day_friday: 'Vendredi', day_saturday: 'Samedi', day_sunday: 'Dimanche',
  },
}

for (const [language, values] of Object.entries(translations)) {
  i18n.addResourceBundle(language, 'translation', values, true, true)
}
