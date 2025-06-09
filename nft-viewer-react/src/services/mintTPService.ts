// services/mintTPService.ts
import { ethers } from 'ethers';
import { 
  TP_CONTRACT_ADDRESS, 
  TP_CONTRACT_ABI, 
  type MintTPRequest, 
  type CertificateInfo 
} from '../constants/tpConstants';

export interface MintResult {
  success: boolean;
  transactionHash?: string;
  tokenId?: number;
  error?: string;
  etherscanUrl?: string;
}

export class MintTPService {
  
  /**
   * 🎯 Función principal para mintear NFT TP
   */
  static async mintTPNFT(request: MintTPRequest): Promise<MintResult> {
    try {
      console.log('🚀 Iniciando mint de NFT TP...', request);

      // ✅ Verificar que MetaMask esté disponible
      if (!window.ethereum) {
        throw new Error('MetaMask no está instalado');
      }

      // ✅ Conectar con el proveedor
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // ✅ Verificar que estamos en Sepolia
      const network = await provider.getNetwork();
      if (network.chainId !== 11155111n) {
        throw new Error('Por favor cambia a la red Sepolia Testnet');
      }

      // ✅ Crear instancia del contrato
      const contract = new ethers.Contract(TP_CONTRACT_ADDRESS, TP_CONTRACT_ABI, signer);

      // ✅ Verificar que la wallet está autorizada (para testing)
      const isAuthorized = await contract.isAuthorizedWallet(request.recipientAddress);
      if (!isAuthorized) {
        throw new Error('Wallet no autorizada para recibir NFT TP');
      }

      // ✅ Usar fecha personalizada o generar fecha actual
      const currentDate = request.customDate || new Date().toISOString().split('T')[0];

      // ✅ Preparar parámetros para el contrato
      const mintParams = [
        request.recipientAddress,
        request.studentName,
        currentDate,
        request.unqTokenIds
      ];

      console.log('📝 Parámetros de mint:', mintParams);

      // ✅ Estimar gas
      let gasEstimate;
      try {
        gasEstimate = await contract.mintCertificate.estimateGas(...mintParams);
        console.log('⛽ Gas estimado:', gasEstimate.toString());
      } catch (gasError) {
        console.error('❌ Error estimando gas:', gasError);
        throw new Error('Error estimando gas. Verifica los parámetros.');
      }

      // ✅ Ejecutar transacción
      console.log('⏳ Enviando transacción...');
      const tx = await contract.mintCertificate(...mintParams, {
        gasLimit: gasEstimate + 50000n // Agregar buffer de gas
      });

      console.log('📤 Transacción enviada:', tx.hash);

      // ✅ Esperar confirmación
      console.log('⌛ Esperando confirmación...');
      const receipt = await tx.wait();

      if (!receipt) {
        throw new Error('No se recibió confirmación de la transacción');
      }

      console.log('✅ Transacción confirmada en bloque:', receipt.blockNumber);

      // ✅ Extraer token ID del evento
      const tokenId = await this.extractTokenIdFromReceipt(receipt, contract);

      // ✅ Resultado exitoso
      const result: MintResult = {
        success: true,
        transactionHash: tx.hash,
        tokenId,
        etherscanUrl: `https://sepolia.etherscan.io/tx/${tx.hash}`
      };

      console.log('🎉 Mint exitoso:', result);
      return result;

    } catch (error) {
      console.error('❌ Error en mint TP:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * 🔍 Extraer token ID del receipt de la transacción
   */
  private static async extractTokenIdFromReceipt(
    receipt: any, 
    contract: ethers.Contract
  ): Promise<number | undefined> {
    try {
      // Buscar evento CertificateMinted en los logs
      const logs = receipt.logs || [];
      
      for (const log of logs) {
        try {
          const parsedLog = contract.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          
          if (parsedLog && parsedLog.name === 'CertificateMinted') {
            const tokenId = Number(parsedLog.args.tokenId);
            console.log('🎯 Token ID extraído del evento:', tokenId);
            return tokenId;
          }
        } catch (parseError) {
          // Log no es del contrato, continuar
          continue;
        }
      }
      
      console.log('⚠️ No se pudo extraer token ID del evento');
      return undefined;
      
    } catch (error) {
      console.error('❌ Error extrayendo token ID:', error);
      return undefined;
    }
  }

  /**
   * 🔍 Verificar si una wallet puede recibir certificado
   */
  static async canWalletReceiveCertificate(walletAddress: string): Promise<boolean> {
    try {
      if (!window.ethereum) return false;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(TP_CONTRACT_ADDRESS, TP_CONTRACT_ABI, provider);

      const isAuthorized = await contract.isAuthorizedWallet(walletAddress);
      return isAuthorized;

    } catch (error) {
      console.error('❌ Error verificando wallet:', error);
      return false;
    }
  }

  /**
   * 📖 Obtener información completa de un certificado por Token ID
   */
  static async getCertificateByTokenId(tokenId: number): Promise<CertificateInfo | null> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask no disponible');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(TP_CONTRACT_ADDRESS, TP_CONTRACT_ABI, provider);

      const certificate = await contract.getCertificate(tokenId);
      
      return {
        tokenId,
        studentName: certificate.studentName,
        completionDate: certificate.completionDate,
        studentWallet: certificate.studentWallet,
        unqTokenIds: certificate.unqTokenIds.map((id: any) => Number(id)),
        mintTimestamp: Number(certificate.mintTimestamp),
        exists: certificate.exists,
        mintDate: new Date(Number(certificate.mintTimestamp) * 1000).toISOString().split('T')[0]
      };

    } catch (error) {
      console.error('❌ Error obteniendo certificado:', error);
      return null;
    }
  }

  /**
   * 📊 Obtener total de certificados emitidos
   */
  static async getTotalSupply(): Promise<number> {
    try {
      if (!window.ethereum) return 0;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(TP_CONTRACT_ADDRESS, TP_CONTRACT_ABI, provider);

      const total = await contract.totalSupply();
      return Number(total);

    } catch (error) {
      console.error('❌ Error obteniendo total supply:', error);
      return 0;
    }
  }

  /**
   * 🔍 Obtener certificado de una transacción específica
   */
  static async getCertificateFromTransaction(txHash: string): Promise<CertificateInfo | null> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask no disponible');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Obtener receipt de la transacción
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        throw new Error('Transacción no encontrada');
      }

      // Crear instancia del contrato para parsear eventos
      const contract = new ethers.Contract(TP_CONTRACT_ADDRESS, TP_CONTRACT_ABI, provider);

      // Buscar evento CertificateMinted
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          
          if (parsedLog && parsedLog.name === 'CertificateMinted') {
            const tokenId = Number(parsedLog.args.tokenId);
            
            // Obtener datos completos del certificado
            return await this.getCertificateByTokenId(tokenId);
          }
        } catch (parseError) {
          continue;
        }
      }

      throw new Error('No se encontró evento CertificateMinted en la transacción');

    } catch (error) {
      console.error('❌ Error obteniendo certificado de transacción:', error);
      return null;
    }
  }
}