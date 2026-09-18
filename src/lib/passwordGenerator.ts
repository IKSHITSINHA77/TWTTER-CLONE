// src/lib/passwordGenerator.ts

/**
 * Generates a random password strictly composed of uppercase and lowercase letters.
 * Explicitly excludes numbers and special characters.
 */
export const generateLettersOnlyPassword = (length: number = 12): string => {
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const values = new Uint32Array(length);
    window.crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      result += letters[values[i] % letters.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
  }

  return result;
};

/**
 * Validates that the password contains ONLY uppercase and lowercase letters.
 */
export const isLettersOnly = (password: string): boolean => {
  return /^[A-Za-z]+$/.test(password);
};