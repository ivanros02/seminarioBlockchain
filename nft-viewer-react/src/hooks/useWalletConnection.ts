import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useNFTLoader } from './useNFTLoader';
import { useValidationMessages } from './useValidationMessages';
import { useMintTP } from './useMintTP'; // ✅ Import corregido

export const useWalletConnection = () => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  
  const {
    nfts,
    loading,
    error,
    validationResult,
    loadAndValidateNFTs,
    reset
  } = useNFTLoader();

  const { generateErrorMessages } = useValidationMessages();
  
  // ✅ Nuevo hook de mint TP
  const { mintTP, isMinting, mintResults, error: mintError, resetMintState } = useMintTP();

  // ✅ Función actualizada de mint
  const handleMintTP = useCallback(async () => {
    if (!walletAddress) {
      toast.error("No hay wallet conectada");
      return;
    }

    if (!validationResult?.isValid) {
      toast.error("Las validaciones no están completas");
      return;
    }

    // ✅ Solicitar nombre del estudiante
    const studentName = prompt("Ingresa el nombre del estudiante:")?.trim();
    
    if (!studentName) {
      toast.error("Nombre requerido para el certificado");
      return;
    }

    // ✅ Ejecutar mint
    await mintTP(walletAddress, studentName, validationResult);
  }, [walletAddress, validationResult, mintTP]);

  const conectarWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("MetaMask no está instalada");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });

      const address = accounts[0];
      setWalletAddress(address);
      reset();
      resetMintState(); // ✅ Reset mint state al conectar nueva wallet

      const { validation } = await loadAndValidateNFTs(address);

      if (validation.isValid) {
        toast.success(
          "🎉 ¡Validación exitosa! Todos los requisitos se cumplen. Puedes proceder con el mint del TP."
        );
      } else {
        const errorMessages = generateErrorMessages(validation, nfts.length);
        toast.error(`⚠️ Validación fallida:\n${errorMessages.join('\n')}`);
      }

    } catch (err) {
      console.error("Error al conectar wallet:", err);
      toast.error("Error al conectar la wallet o cargar NFTs.");
    }
  }, [loadAndValidateNFTs, nfts.length, reset, generateErrorMessages, resetMintState]);

  return {
    walletAddress,
    nfts,
    loading,
    error,
    validationResult,
    conectarWallet,
    handleMintTP,
    // ✅ Nuevos estados de mint
    isMinting,
    mintResults,
    mintError
  };
};