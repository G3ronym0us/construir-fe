// Mock global de next-intl para todos los tests unitarios/componentes
// Retorna la key de traducción tal cual — suficiente para verificar comportamiento
export const useTranslations = () => {
  const t = (key: string) => key;
  // `t.has()` lo usan las pantallas con claves dinámicas (los recursos de los
  // audit logs, por ejemplo): acá siempre resuelve, igual que `t`.
  t.has = () => true;
  return t;
};
export const useLocale = () => 'es';
export const useMessages = () => ({});
export const NextIntlClientProvider = ({ children }: { children: React.ReactNode }) => children;
