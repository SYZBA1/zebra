export const normalizeTransactionRef = (value: string) => value.trim().replace(/\s+/g, "").toUpperCase();

export const isValidTransactionRef = (value: string) => {
  const ref = normalizeTransactionRef(value);
  if (!ref || ref.length < 8 || ref.length > 64) return false;
  if (!/^[A-Z0-9]+$/.test(ref)) return false;
  if (/^(.)\1+$/.test(ref)) return false;
  return true;
};

export const getPurchaseStatus = (value: string) => (isValidTransactionRef(value) ? "approved" : "pending");
