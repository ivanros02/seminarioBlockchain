// services/promotionService.ts
import { ethers } from 'ethers';

// 🎓 Dirección del contrato de promoción (actualizar después del deploy)
// test 0x0e6586512ba0e1395C4576267CC8c62f5a4EA18C
// test 2 0xcdfB098192a9714D9338E35A887bcf8286833EdF
export const PROMOTION_CONTRACT_ADDRESS = "0xcdfB098192a9714D9338E35A887bcf8286833EdF";

// 🔑 ABI del contrato de promoción
export const PROMOTION_CONTRACT_ABI = [
  // Constructor y eventos
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "student",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "professor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "studentName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "promotionText",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "professorName",
        "type": "string"
      }
    ],
    "name": "PromotionMinted",
    "type": "event"
  },
  
  // Función principal
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "studentWallet",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "studentName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "promotionText",
        "type": "string"
      }
    ],
    "name": "promoteStudent",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  
  // Funciones de lectura
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "professor",
        "type": "address"
      }
    ],
    "name": "canProfessorPromote",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getPromotion",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "studentName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "promotionText",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "studentWallet",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "professorWallet",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "professorName",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "promotionTimestamp",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          }
        ],
        "internalType": "struct PromotionCertificate.PromotionData",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "student",
        "type": "address"
      }
    ],
    "name": "getStudentPromotions",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "professor",
        "type": "address"
      }
    ],
    "name": "getProfessorPromotions",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// 🏷️ Tipos TypeScript
export interface PromotionData {
  studentName: string;
  promotionText: string;
  studentWallet: string;
  professorWallet: string;
  professorName: string;
  promotionTimestamp: number;
  exists: boolean;
  tokenId: number;
  promotionDate: string; // Fecha formateada
}

export interface PromotionRequest {
  studentWallet: string;
  studentName: string;
  promotionText: string;
}

export interface PromotionResult {
  success: boolean;
  transactionHash?: string;
  tokenId?: number;
  error?: string;
  etherscanUrl?: string;
}

export class PromotionService {
  
  /**
   * 🎓 Verificar si profesor puede promocionar
   */
  static async canProfessorPromote(professorWallet: string): Promise<boolean> {
    try {
      if (!window.ethereum) return false;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(PROMOTION_CONTRACT_ADDRESS, PROMOTION_CONTRACT_ABI, provider);

      const canPromote = await contract.canProfessorPromote(professorWallet);
      return canPromote;

    } catch (error) {
      console.error('❌ Error verificando si profesor puede promocionar:', error);
      return false;
    }
  }

  /**
   * 🎯 Promocionar estudiante
   */
  static async promoteStudent(request: PromotionRequest): Promise<PromotionResult> {
    try {
      console.log('🚀 Iniciando promoción de estudiante...', request);

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
      const contract = new ethers.Contract(PROMOTION_CONTRACT_ADDRESS, PROMOTION_CONTRACT_ABI, signer);

      // ✅ Verificar que el profesor puede promocionar
      const professorAddress = await signer.getAddress();
      const canPromote = await contract.canProfessorPromote(professorAddress);
      if (!canPromote) {
        throw new Error('Profesor no autorizado o no tiene NFT TP requerido');
      }

      // ✅ Preparar parámetros para el contrato
      const promoteParams = [
        request.studentWallet,
        request.studentName,
        request.promotionText
      ];

      console.log('📝 Parámetros de promoción:', promoteParams);

      // ✅ Estimar gas
      let gasEstimate;
      try {
        gasEstimate = await contract.promoteStudent.estimateGas(...promoteParams);
        console.log('⛽ Gas estimado:', gasEstimate.toString());
      } catch (gasError) {
        console.error('❌ Error estimando gas:', gasError);
        throw new Error('Error estimando gas. Verifica los parámetros.');
      }

      // ✅ Ejecutar transacción
      console.log('⏳ Enviando transacción de promoción...');
      const tx = await contract.promoteStudent(...promoteParams, {
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
      const result: PromotionResult = {
        success: true,
        transactionHash: tx.hash,
        tokenId,
        etherscanUrl: `https://sepolia.etherscan.io/tx/${tx.hash}`
      };

      console.log('🎉 Promoción exitosa:', result);
      return result;

    } catch (error) {
      console.error('❌ Error en promoción:', error);
      
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
      // Buscar evento PromotionMinted en los logs
      const logs = receipt.logs || [];
      
      for (const log of logs) {
        try {
          const parsedLog = contract.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          
          if (parsedLog && parsedLog.name === 'PromotionMinted') {
            const tokenId = Number(parsedLog.args.tokenId);
            console.log('🎯 Token ID de promoción extraído:', tokenId);
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
   * 📖 Obtener datos de promoción por token ID
   */
  static async getPromotionByTokenId(tokenId: number): Promise<PromotionData | null> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask no disponible');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(PROMOTION_CONTRACT_ADDRESS, PROMOTION_CONTRACT_ABI, provider);

      const promotion = await contract.getPromotion(tokenId);
      
      return {
        tokenId,
        studentName: promotion.studentName,
        promotionText: promotion.promotionText,
        studentWallet: promotion.studentWallet,
        professorWallet: promotion.professorWallet,
        professorName: promotion.professorName,
        promotionTimestamp: Number(promotion.promotionTimestamp),
        exists: promotion.exists,
        promotionDate: new Date(Number(promotion.promotionTimestamp) * 1000).toISOString().split('T')[0]
      };

    } catch (error) {
      console.error('❌ Error obteniendo promoción:', error);
      return null;
    }
  }

  /**
   * 📊 Obtener promociones de un estudiante
   */
  static async getStudentPromotions(studentWallet: string): Promise<PromotionData[]> {
    try {
      if (!window.ethereum) return [];

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(PROMOTION_CONTRACT_ADDRESS, PROMOTION_CONTRACT_ABI, provider);

      const tokenIds = await contract.getStudentPromotions(studentWallet);
      const promotions: PromotionData[] = [];

      for (const tokenId of tokenIds) {
        const promotion = await this.getPromotionByTokenId(Number(tokenId));
        if (promotion) {
          promotions.push(promotion);
        }
      }

      return promotions;

    } catch (error) {
      console.error('❌ Error obteniendo promociones del estudiante:', error);
      return [];
    }
  }
}