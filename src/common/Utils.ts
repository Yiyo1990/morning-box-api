
/**
 * Convierte la primera letra de cada palabra en mayúscula
 * @param text - El texto a capitalizar
 * @returns - El texto capitalizado
 */
export const capitalizeWords = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Elimina espacios en blanco al inicio y al final de un texto
 * @param text - El texto a recortar
 * @returns - El texto recortado
 */
export const trim = (text: string): string => {
  return text.trimStart().trimEnd()
}

/**
 * Normaliza un texto, eliminando acentos y caracteres especiales
 * @param texto - El texto a normalizar
 * @returns - El texto normalizado
 */
export const normalizeText = (texto: string): string => {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "");
};