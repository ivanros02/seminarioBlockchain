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

  // ✅ Función para cargar solo NFTs
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

  // ✅ Función para validar (solo strict - las 3 validaciones)
  const validateNFTs = useCallback(async (address: string) => {
    setLoading(true);
    setError('');
    
    try {
      console.log(`🔍 Iniciando validación strict para ${address}`);
      
      // Solo usar validateNFTsStrict - las 3 validaciones esenciales
      const validation = await NFTValidator.validateNFTsStrict(address);
      
      setValidationResult(validation);
      
      console.log(`🎯 Validación completada:`, {
        isValid: validation.isValid,
        hasExactly10NFTs: validation.hasExactly10NFTs,
        allNFTsValid: validation.allNFTsValid,
        validMintDates: validation.validMintDates,
        invalidCount: validation.invalidNFTs.length
      });
      
      return validation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en validación';
      setError(errorMessage);
      console.error('❌ Error en validación:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Función combinada - cargar NFTs y validar
  const loadAndValidateNFTs = useCallback(async (address: string) => {
    setLoading(true);
    setError('');
    setValidationResult(null);

    try {
      console.log(`🚀 Cargando y validando NFTs para ${address}`);
      
      // Paso 1: Cargar NFTs
      const nftResults = await NFTLoader.loadNFTs(address);
      setNfts(nftResults);
      console.log(`📦 Cargados ${nftResults.length} NFTs`);

      // Paso 2: Validar (las 3 validaciones esenciales)
      const validation = await NFTValidator.validateNFTsStrict(address);
      setValidationResult(validation);

      console.log(`🎯 Proceso completado:`, {
        nftsLoaded: nftResults.length,
        validationPassed: validation.isValid,
        errors: validation.errors.length
      });

      return {
        nfts: nftResults,
        validation
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en proceso de validación';
      setError(errorMessage);
      console.error('❌ Error en loadAndValidateNFTs:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Reset state
  const reset = useCallback(() => {
    setNfts([]);
    setError('');
    setValidationResult(null);
    setLoading(false);
    console.log('🔄 Estado reseteado');
  }, []);

  return {
    // ✅ Estado
    nfts,
    loading,
    error,
    validationResult,
    
    // ✅ Acciones principales
    loadNFTs,                // Solo cargar NFTs
    validateNFTs,            // Solo validar (3 validaciones)
    loadAndValidateNFTs,     // Cargar + Validar
    
    // ✅ Utilidades
    reset
  };
};

// ✅ Exportar tipos
export type { ValidationResult } from '../types/validation';
export type { NFTValidationDetail } from '../types/validation';