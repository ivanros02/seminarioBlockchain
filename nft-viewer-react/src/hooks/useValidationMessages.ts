import { useCallback } from 'react';
import type { ValidationResult } from '../types/validation';

export const useValidationMessages = () => {
  const generateErrorMessages = useCallback((validation: ValidationResult, nftsLength: number) => {
    const errorMessages = [
      !validation.hasExactly10NFTs && `❌ Necesitas exactamente 10 NFTs UNQ (tienes ${nftsLength})`,
      !validation.allNFTsValid && `❌ Algunos NFTs han sido retransferidos`,
      !validation.validMintDates && `❌ Algunos NFTs no cumplen la fecha límite (28/05/2025)`,
      ...validation.errors
    ].filter(Boolean);

    return errorMessages;
  }, []);

  return { generateErrorMessages };
};