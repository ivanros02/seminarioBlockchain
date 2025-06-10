// hooks/usePromotion.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { PromotionService, type PromotionResult } from '../services/promotionService';

interface UsePromotionReturn {
  promoteStudent: (
    professorWallet: string,
    studentWallet: string,
    studentName: string,
    promotionText: string
  ) => Promise<PromotionResult>;
  isPromoting: boolean;
  promotionResult: PromotionResult | null;
  error: string | null;
  resetPromotionState: () => void;
  canProfessorPromote: (professorWallet: string) => Promise<boolean>;
}

export const usePromotion = (): UsePromotionReturn => {
  const [isPromoting, setIsPromoting] = useState(false);
  const [promotionResult, setPromotionResult] = useState<PromotionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const promoteStudent = useCallback(async (
    professorWallet: string,
    studentWallet: string,
    studentName: string,
    promotionText: string
  ): Promise<PromotionResult> => {
    try {
      setIsPromoting(true);
      setError(null);
      setPromotionResult(null);

      console.log('🎓 Iniciando promoción:', {
        profesor: professorWallet,
        estudiante: { wallet: studentWallet, nombre: studentName },
        texto: promotionText
      });

      // Validaciones básicas
      if (!studentWallet || !studentName.trim() || !promotionText.trim()) {
        throw new Error('Todos los campos son requeridos');
      }

      if (promotionText.length > 500) {
        throw new Error('El texto de promoción es muy largo (máximo 500 caracteres)');
      }

      // Verificar que el profesor puede promocionar
      const canPromote = await PromotionService.canProfessorPromote(professorWallet);
      if (!canPromote) {
        throw new Error('Profesor no autorizado o no tiene NFT TP requerido');
      }

      toast.info('🚀 Iniciando promoción del estudiante...');

      // Ejecutar promoción
      const result = await PromotionService.promoteStudent({
        studentWallet,
        studentName: studentName.trim(),
        promotionText: promotionText.trim()
      });

      setPromotionResult(result);

      if (result.success) {
        toast.success(
          `🎉 ¡Estudiante promocionado exitosamente!\n` +
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
    canProfessorPromote
  };
};