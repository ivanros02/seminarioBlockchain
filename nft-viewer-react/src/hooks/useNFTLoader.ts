import { useState, useCallback } from 'react';
import type { NFT } from '../types/NFT';
import type { ValidationResult } from '../types/validation';
import { NFTValidator } from '../validators/nftValidator';
import { NFTLoader } from '../services/nftLoader';

export const useNFTLoader = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Función para cargar solo NFTs
  const loadNFTs = useCallback(async (address: string) => {
    setLoading(true);
    setError('');
    
    try {
      const results = await NFTLoader.loadNFTs(address);
      setNfts(results);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando NFTs';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para validar con diferentes modos
  const validateNFTs = useCallback(async (
    address: string, 
    mode: 'strict' | 'permissive' | 'simple' = 'permissive'
  ) => {
    setLoading(true);
    setError('');
    
    try {
      let validation: ValidationResult;
      
      switch (mode) {
        case 'strict':
          validation = await NFTValidator.validateNFTsStrict(address);
          break;
        case 'simple':
          validation = await NFTValidator.validateNFTsSimple(address);
          break;
        default:
          validation = await NFTValidator.validateNFTs(address);
      }
      
      setValidationResult(validation);
      return validation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en validación';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función combinada (la más usada)
  const loadAndValidateNFTs = useCallback(async (
    address: string,
    validationMode: 'strict' | 'permissive' | 'simple' = 'permissive'
  ) => {
    setLoading(true);
    setError('');
    setValidationResult(null);

    try {
      // Cargar NFTs
      const nftResults = await NFTLoader.loadNFTs(address);
      setNfts(nftResults);

      // Realizar validación según el modo
      let validation: ValidationResult;
      
      switch (validationMode) {
        case 'strict':
          validation = await NFTValidator.validateNFTsStrict(address);
          break;
        case 'simple':
          validation = await NFTValidator.validateNFTsSimple(address);
          break;
        default:
          validation = await NFTValidator.validateNFTs(address);
      }
      
      setValidationResult(validation);

      return {
        nfts: nftResults,
        validation
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Métodos específicos para cada tipo de validación
  const validateStrict = useCallback(async (address: string) => {
    return await validateNFTs(address, 'strict');
  }, [validateNFTs]);

  const validatePermissive = useCallback(async (address: string) => {
    return await validateNFTs(address, 'permissive');
  }, [validateNFTs]);

  const validateSimple = useCallback(async (address: string) => {
    return await validateNFTs(address, 'simple');
  }, [validateNFTs]);

  const reset = useCallback(() => {
    setNfts([]);
    setError('');
    setValidationResult(null);
    setLoading(false);
  }, []);

  return {
    // Estado
    nfts,
    loading,
    error,
    validationResult,
    
    // Acciones principales
    loadNFTs,
    validateNFTs,
    loadAndValidateNFTs,
    
    // Acciones específicas
    validateStrict,
    validatePermissive,
    validateSimple,
    
    // Utilidades
    reset
  };
};

// Exportar también los tipos para mantener compatibilidad
export type { ValidationResult } from '../types/validation';
export type { NFTValidationDetail } from '../types/validation';
