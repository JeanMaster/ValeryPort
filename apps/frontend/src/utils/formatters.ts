/**
 * Formatea un número al formato venezolano
 * - Puntos para separar miles
 * - Comas para decimales
 * Ejemplos:
 * - 31395.00 → "31.395,00"
 * - 1234.56 → "1.234,56"
 * - 1000000.00 → "1.000.000,00"
 */
export const formatVenezuelanNumber = (value: number, decimals: number = 2): string => {
    // Convertir a string con los decimales especificados
    const parts = value.toFixed(decimals).split('.');

    // Formatear la parte entera con puntos para miles
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Usar coma para decimales
    const decimalPart = parts[1];

    return `${integerPart},${decimalPart}`;
};

/**
 * Formatea un precio con símbolo de moneda en formato venezolano
 */
export const formatVenezuelanPrice = (value: number, currencySymbol: string = 'Bs', decimals: number = 2): string => {
    return `${formatVenezuelanNumber(value, decimals)} ${currencySymbol}`;
};

/**
 * Formatea un precio sin símbolo de moneda en formato venezolano
 */
export const formatVenezuelanPriceOnly = (value: number, decimals: number = 2): string => {
    return formatVenezuelanNumber(value, decimals);
};