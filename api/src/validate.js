function isNonEmptyString(v, maxLen = 500) {
  return typeof v === 'string' && v.trim().length > 0 && v.length <= maxLen;
}

function isOptionalString(v, maxLen = 2000) {
  return v === undefined || v === null || (typeof v === 'string' && v.length <= maxLen);
}

function isPositiveInt(v) {
  return Number.isInteger(v) && v > 0;
}

module.exports = { isNonEmptyString, isOptionalString, isPositiveInt };
