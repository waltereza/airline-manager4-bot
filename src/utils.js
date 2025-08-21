function priceParser(raw) {
  if (raw == null) return NaN;

  // Normaliza: remove símbolos de moeda, %, espaços, etc.
  let s = String(raw).trim().replace(/[^0-9.,-]/g, '');

  if (s.includes('.') && s.includes(',')) {
    const lastDot = s.lastIndexOf('.');
    const lastComma = s.lastIndexOf(',');
    const decimalSep = lastDot > lastComma ? '.' : ',';
    const thousandSep = decimalSep === '.' ? ',' : '.';
    const noThousands = s.replaceAll(thousandSep, '');
    return parseFloat(noThousands.replace(decimalSep, '.'));
  }

  if (s.includes(',') && !s.includes('.')) {
    const [intPart, fracPart] = s.split(',');
    if (fracPart && fracPart.length === 3) {
      return parseFloat((intPart + fracPart).replace(/[^\d-]/g, ''));
    }
    return parseFloat((intPart + '.' + (fracPart || '')).replace(/[^\d.-]/g, ''));
  }

  if (s.includes('.') && !s.includes(',')) {
    const [intPart, fracPart] = s.split('.');
    if (fracPart && fracPart.length === 3) {
      return parseFloat((intPart + fracPart).replace(/[^\d-]/g, ''));
    }
    return parseFloat(s.replace(/[^\d.-]/g, ''));
  }

  return parseFloat(s.replace(/[^\d-]/g, ''));
}

module.exports = priceParser;