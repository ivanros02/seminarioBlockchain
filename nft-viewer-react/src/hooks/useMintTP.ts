// hooks/useMintTP.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { MintTPService, type MintResult } from '../services/mintTPService';
import type { ValidationResult } from '../types/validation';

interface UseMintTPReturn {
  mintTP: (
    walletAddress: string,
    studentName: string,
    validationResult: ValidationResult
  ) => Promise<void>;
  isMinting: boolean;
  mintResults: {
    pablo: MintResult | null;
    daniel: MintResult | null;
  };
  error: string | null;
  resetMintState: () => void;
}

export const useMintTP = (): UseMintTPReturn => {
  const [isMinting, setIsMinting] = useState(false);
  const [mintResults, setMintResults] = useState<{
    pablo: MintResult | null;
    daniel: MintResult | null;
    test?: MintResult | null; // Opcional para pruebas
  }>({
    pablo: null,
    daniel: null,
    test: null
  });
  const [error, setError] = useState<string | null>(null);

  // 🎓 Direcciones hardcodeadas de los profesores (del contrato)
  const PABLO_WALLET = '0x96664195a728321F0F672B3BA29639eD727CE7a1';
  const DANIEL_WALLET = '0x81Bce31CaB4F37DdC8561550Ee7eaa859ca50581';
  const TEST_WALLET = '0x05788623D682889fc8F4024718Be8ec2b0bCe77B';

  const mintTP = useCallback(async (
    walletAddress: string,
    studentName: string,
    validationResult: ValidationResult
  ) => {
    try {
      setIsMinting(true);
      setError(null);
      setMintResults({ pablo: null, daniel: null, test: null });

      // ✅ Validaciones previas
      if (!validationResult?.isValid) {
        throw new Error('Las validaciones no están completas');
      }

      if (!validationResult.hasExactly10NFTs) {
        throw new Error('Se requieren exactamente 10 NFTs UNQ');
      }

      if (!validationResult.allNFTsValid) {
        throw new Error('Algunos NFTs han sido retransferidos');
      }

      if (!validationResult.validMintDates) {
        throw new Error('Algunas fechas de mint son inválidas');
      }

      if (!validationResult.nftDetails || validationResult.nftDetails.length !== 10) {
        throw new Error('Datos de NFTs incompletos');
      }

      // ✅ Preparar datos comunes para ambos profesores
      const unqTokenIds = validationResult.nftDetails.map(detail => detail.tokenId);

      // 🎯 FORMATO CONSISTENTE para ambos profesores
      const formattedStudentName = `👤 Estudiante: ${studentName.trim()}`;

      console.log('🎯 Iniciando mint automático para ambos profesores:', {
        originalWallet: walletAddress,
        formattedStudentName,
        unqTokenIds,
        pabloWallet: PABLO_WALLET,
        danielWallet: DANIEL_WALLET
      });

      // ✅ Mostrar toast de inicio
      toast.info('🚀 Iniciando mint automático para profesores Pablo y Daniel...');

      // 🎓 MINT PARA PABLO
      console.log('🔄 Minteando para Pablo...');
      toast.info('👨‍🏫 Minteando NFT TP para profesor Pablo...');

      const pabloResult = await MintTPService.mintTPNFT({
        recipientAddress: PABLO_WALLET,
        realStudentWallet: walletAddress,
        studentName: formattedStudentName,
        unqTokenIds
      });

      setMintResults(prev => ({ ...prev, pablo: pabloResult }));

      if (!pabloResult.success) {
        throw new Error(`Error minteando para Pablo: ${pabloResult.error}`);
      }

      console.log('✅ Mint exitoso para Pablo:', pabloResult);

      // 🎓 MINT PARA DANIEL
      console.log('🔄 Minteando para Daniel...');
      toast.info('👨‍🏫 Minteando NFT TP para profesor Daniel...');

      const danielResult = await MintTPService.mintTPNFT({
        recipientAddress: DANIEL_WALLET,
        realStudentWallet: walletAddress,
        studentName: formattedStudentName,
        unqTokenIds
      });

      setMintResults(prev => ({ ...prev, daniel: danielResult }));

      if (!danielResult.success) {
        throw new Error(`Error minteando para Daniel: ${danielResult.error}`);
      }

      console.log('✅ Mint exitoso para Daniel:', danielResult);

      // 🎓 MINT PARA TEST
      console.log('🔄 Minteando para Test...');
      toast.info('🧪 Minteando NFT TP para wallet Test...');

      const testResult = await MintTPService.mintTPNFT({
        recipientAddress: TEST_WALLET,
        realStudentWallet: walletAddress,
        studentName: formattedStudentName,
        unqTokenIds
      });

      setMintResults(prev => ({ ...prev, test: testResult }));

      if (!testResult.success) {
        throw new Error(`Error minteando para Test: ${testResult.error}`);
      }

      console.log('✅ Mint exitoso para Test:', testResult);

      // ✅ Verificar resultados finales
      const successCount = (pabloResult.success ? 1 : 0) + (danielResult.success ? 1 : 0) + (testResult.success ? 1 : 0);

      if (successCount === 3) {
        toast.success(
          `🎉 ¡Mint completado! NFTs TP creados para los 3 profesores!\n` +
          `Pablo Token ID: ${pabloResult.tokenId}\n` +
          `Daniel Token ID: ${danielResult.tokenId}\n` +
          `Test Token ID: ${testResult.tokenId}`
        );
      } else {
        throw new Error(`Solo ${successCount}/3 mints exitosos`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      toast.error(`❌ Error en mint automático: ${errorMessage}`);
      console.error('❌ Error en mint TP:', error);
    } finally {
      setIsMinting(false);
    }
  }, []);

  const resetMintState = useCallback(() => {
    setMintResults({ pablo: null, daniel: null });
    setError(null);
    setIsMinting(false);
  }, []);

  return {
    mintTP,
    isMinting,
    mintResults,
    error,
    resetMintState
  };
};