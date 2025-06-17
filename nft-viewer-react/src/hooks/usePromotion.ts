// hooks/usePromotion.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { PromotionService, type PromotionResult } from '../services/promotionService';

interface UsePromotionReturn {
  promoteStudent: (
    professorWallet: string,
    studentWallet: string,
    studentName: string,
    promotionText: string,
    grade: string,
    claimedTokenIds: number[] // ✅ NUEVO PARÁMETRO OBLIGATORIO
  ) => Promise<PromotionResult>;
  isPromoting: boolean;
  promotionResult: PromotionResult | null;
  error: string | null;
  resetPromotionState: () => void;
  canProfessorPromote: (professorWallet: string) => Promise<boolean>;
  validateStudentNFTs: (studentWallet: string, claimedTokenIds: number[]) => Promise<{ isValid: boolean; invalidIds: number[] }>; // ✅ NUEVA FUNCIÓN
}

export const usePromotion = (): UsePromotionReturn => {
  const [isPromoting, setIsPromoting] = useState(false);
  const [promotionResult, setPromotionResult] = useState<PromotionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const promoteStudent = useCallback(async (
    professorWallet: string,
    studentWallet: string,
    studentName: string,
    promotionText: string,
    grade: string,
    claimedTokenIds: number[] // ✅ NUEVO PARÁMETRO
  ): Promise<PromotionResult> => {
    try {
      setIsPromoting(true);
      setError(null);
      setPromotionResult(null);

      console.log('🎓 Iniciando promoción:', {
        profesor: professorWallet,
        estudiante: { wallet: studentWallet, nombre: studentName },
        texto: promotionText,
        nota: grade,
        nftsReclamados: claimedTokenIds // ✅ AGREGADO AL LOG
      });

      // ✅ Validaciones básicas actualizadas
      if (!studentWallet || !studentName.trim() || !promotionText.trim() || !grade.trim()) {
        throw new Error('Todos los campos son requeridos (incluida la nota)');
      }

      if (promotionText.length > 500) {
        throw new Error('El texto de promoción es muy largo (máximo 500 caracteres)');
      }

      if (grade.length > 50) {
        throw new Error('La nota es muy larga (máximo 50 caracteres)');
      }

      // ✅ NUEVA VALIDACIÓN: NFTs reclamados
      if (!claimedTokenIds || claimedTokenIds.length === 0) {
        throw new Error('Debe especificar al menos un NFT que el estudiante posee');
      }

      // Verificar que el profesor puede promocionar
      const canPromote = await PromotionService.canProfessorPromote(professorWallet);
      if (!canPromote) {
        throw new Error('Profesor no autorizado o no tiene NFT TP requerido');
      }

      // ✅ Pre-validar NFTs del estudiante (opcional, para mejor UX)
      toast.info('🔍 Validando NFTs del estudiante...');
      const nftValidation = await PromotionService.validateStudentNFTs(studentWallet, claimedTokenIds);
      
      if (!nftValidation.isValid) {
        throw new Error(
          `Estudiante no posee los siguientes NFTs: ${nftValidation.invalidIds.join(', ')}`
        );
      }

      toast.info('🚀 Iniciando promoción del estudiante...');

      // ✅ Ejecutar promoción con todos los campos incluyendo claimedTokenIds
      const result = await PromotionService.promoteStudent({
        studentWallet,
        studentName: studentName.trim(),
        promotionText: promotionText.trim(),
        grade: grade.trim(),
        claimedTokenIds // ✅ CAMPO OBLIGATORIO AGREGADO
      });

      setPromotionResult(result);

      if (result.success) {
        toast.success(
          `🎉 ¡Estudiante promocionado exitosamente!\n` +
          `Nota: ${grade}\n` +
          `NFTs validados: ${claimedTokenIds.length}\n` + // ✅ MOSTRAR CANTIDAD DE NFTs
          `Token ID: ${result.tokenId}\n` +
          `Hash: ${result.transactionHash?.slice(0, 10)}...`
        );
      } else {
        toast.error(`❌ Error en promoción: ${result.error}`);
        setError(result.error || 'Error desconocido');
      }

      return result;

    } catch (error) {
      console.error('❌ Error en promoción:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      setError(errorMessage);
      toast.error(`❌ Error: ${errorMessage}`);
      
      const failResult: PromotionResult = {
        success: false,
        error: errorMessage
      };
      
      setPromotionResult(failResult);
      return failResult;
      
    } finally {
      setIsPromoting(false);
    }
  }, []);

  const canProfessorPromote = useCallback(async (professorWallet: string): Promise<boolean> => {
    try {
      return await PromotionService.canProfessorPromote(professorWallet);
    } catch (error) {
      console.error('❌ Error verificando si profesor puede promocionar:', error);
      return false;
    }
  }, []);

  // ✅ NUEVA FUNCIÓN para validar NFTs desde el hook
  const validateStudentNFTs = useCallback(async (
    studentWallet: string, 
    claimedTokenIds: number[]
  ): Promise<{ isValid: boolean; invalidIds: number[] }> => {
    try {
      return await PromotionService.validateStudentNFTs(studentWallet, claimedTokenIds);
    } catch (error) {
      console.error('❌ Error validando NFTs:', error);
      return { isValid: false, invalidIds: claimedTokenIds };
    }
  }, []);

  const resetPromotionState = useCallback(() => {
    setPromotionResult(null);
    setError(null);
    setIsPromoting(false);
  }, []);

  return {
    promoteStudent,
    isPromoting,
    promotionResult,
    error,
    resetPromotionState,
    canProfessorPromote,
    validateStudentNFTs // ✅ NUEVA FUNCIÓN EXPORTADA
  };
};