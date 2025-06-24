// services/promotionService.ts
import { ethers } from 'ethers';

export const PROMOTION_CONTRACT_ADDRESS = "0x1D154bF88a511e112E8C39b6F5e6C274D9986F7b";

// ✅ ABI ACTUALIZADO para el contrato con validación de NFTs
export const PROMOTION_CONTRACT_ABI = [
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
        "name": "grade",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256[]",
        "name": "validatedNFTs",
        "type": "uint256[]"
      }
    ],
    "name": "PromotionMinted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "student",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256[]",
        "name": "invalidIds",
        "type": "uint256[]"
      }
    ],
    "name": "NFTValidationFailed",
    "type": "event"
  },
  
  // ✅ FUNCIÓN PRINCIPAL ACTUALIZADA con claimedTokenIds
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
      },
      {
        "internalType": "string",
        "name": "grade",
        "type": "string"
      },
      {
        "internalType": "uint256[]",
        "name": "claimedTokenIds",
        "type": "uint256[]"
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

  // ✅ NUEVAS FUNCIONES DE VALIDACIÓN
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "studentWallet",
        "type": "address"
      },
      {
        "internalType": "uint256[]",
        "name": "claimedTokenIds",
        "type": "uint256[]"
      }
    ],
    "name": "validateStudentNFTs",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isValid",
        "type": "bool"
      },
      {
        "internalType": "uint256[]",
        "name": "invalidIds",
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
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getOriginalNFTBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  // Funciones existentes (sin cambios)
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
            "internalType": "string",
            "name": "grade",
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
            "internalType": "uint256[]",
            "name": "validatedNFTs",
            "type": "uint256[]"
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
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getPromotionValidatedNFTs",
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
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "exists",
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

  // ✅ FUNCIONES PÚBLICAS para verificación
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "professor",
        "type": "address"
      }
    ],
    "name": "isAuthorizedProfessor",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "pure",
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
  }
];

// ✅ TIPOS ACTUALIZADOS
export interface PromotionData {
  studentName: string;
  promotionText: string;
  grade: string;
  studentWallet: string;
  professorWallet: string;
  validatedNFTs: number[]; // ✅ ACTUALIZADO
  promotionTimestamp: number;
  exists: boolean;
  tokenId: number;
  promotionDate: string;
}

export interface PromotionRequest {
  studentWallet: string;
  studentName: string;
  promotionText: string;
  grade: string;
  claimedTokenIds: number[]; // ✅ NUEVO CAMPO REQUERIDO
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
   * ✅ FUNCIÓN PARA VERIFICAR SI PROFESOR ESTÁ AUTORIZADO
   */
  static async isAuthorizedProfessor(professorWallet: string): Promise<boolean> {
    try {
      if (!window.ethereum) return false;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(PROMOTION_CONTRACT_ADDRESS, PROMOTION_CONTRACT_ABI, provider);

      const isAuthorized = await contract._isAuthorizedProfessor(professorWallet);
      return isAuthorized;

    } catch (error) {
      console.error('❌ Error verificando si profesor está autorizado:', error);
      return false;
    }
  }

  /**
   * ✅ VERIFICAR SI PROFESOR PUEDE PROMOCIONAR (autorizado + tiene NFT TP)
   * Simula la lógica del contrato mientras no esté expuesta públicamente
   */
  static async canProfessorPromote(professorWallet: string): Promise<boolean> {
    try {
      if (!window.ethereum) return false;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(PROMOTION_CONTRACT_ADDRESS, PROMOTION_CONTRACT_ABI, provider);

      // 1. Verificar si es profesor autorizado
      const isAuthorized = await contract.isAuthorizedProfessor(professorWallet);
      if (!isAuthorized) {
        console.log('❌ Profesor no autorizado:', professorWallet);
        return false;
      }

      // 2. Verificar si tiene NFT TP (simulamos la lógica del contrato)
      // El contrato verifica tokens 1-5 en el contrato TP
      const TP_CONTRACT = "0x9C8F4F8FF29DB792Cd58FA16DeE22d38c0b5CAeE";
      
      for (let tokenId = 1; tokenId <= 5; tokenId++) {
        try {
          const balanceCall = await provider.call({
            to: TP_CONTRACT,
            data: ethers.concat([
              "0x00fdd58e", // balanceOf(address,uint256) function selector
              ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [professorWallet, tokenId])
            ])
          });
          
          if (balanceCall && balanceCall !== "0x") {
            const balance = ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], balanceCall)[0];
            if (Number(balance) > 0) {
              console.log('✅ Profesor tiene NFT TP:', { tokenId, balance: Number(balance) });
              return true;
            }
          }
        } catch (tokenError) {
          // Token no existe o error, continuar
          continue;
        }
      }

      console.log('❌ Profesor no tiene NFTs TP');
      return false;

    } catch (error) {
      console.error('❌ Error verificando si profesor puede promocionar:', error);
      return false;
    }
  }

  /**
   * ✅ VALIDAR NFTs DEL ESTUDIANTE
   */
  static async validateStudentNFTs(
    studentWallet: string, 
    claimedTokenIds: number[]
  ): Promise<{ isValid: boolean; invalidIds: number[] }> {
    try {
      if (!window.ethereum) return { isValid: false, invalidIds: claimedTokenIds };

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(PROMOTION_CONTRACT_ADDRESS, PROMOTION_CONTRACT_ABI, provider);

      const [isValid, invalidIds] = await contract.validateStudentNFTs(studentWallet, claimedTokenIds);
      
      return {
        isValid,
        invalidIds: invalidIds.map(Number)
      };

    } catch (error) {
      console.error('❌ Error validando NFTs del estudiante:', error);
      return { isValid: false, invalidIds: claimedTokenIds };
    }
  }

  /**
   * ✅ PROMOCIONAR ESTUDIANTE - ACTUALIZADO con claimedTokenIds
   */
  static async promoteStudent(request: PromotionRequest): Promise<PromotionResult> {
    try {
      console.log('🚀 Iniciando promoción de estudiante...', request);

      if (!window.ethereum) {
        throw new Error('MetaMask no está instalado');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const network = await provider.getNetwork();
      if (network.chainId !== 11155111n) {
        throw new Error('Por favor cambia a la red Sepolia Testnet');
      }

      const contract = new ethers.Contract(PROMOTION_CONTRACT_ADDRESS, PROMOTION_CONTRACT_ABI, signer);

      // ✅ Verificar autorización del profesor usando la función pública
      const professorAddress = await signer.getAddress();
      const canPromote = await contract.canProfessorPromote(professorAddress);
      if (!canPromote) {
        throw new Error('Profesor no autorizado o no tiene NFT TP requerido');
      }

      // ✅ Validar NFTs del estudiante ANTES de promocionar
      const validation = await this.validateStudentNFTs(request.studentWallet, request.claimedTokenIds);
      if (!validation.isValid) {
        throw new Error(`Estudiante no posee los NFTs: ${validation.invalidIds.join(', ')}`);
      }

      // ✅ Parámetros actualizados con claimedTokenIds
      const promoteParams = [
        request.studentWallet,
        request.studentName,
        request.promotionText,
        request.grade,
        request.claimedTokenIds // ✅ NUEVO PARÁMETRO
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
        gasLimit: gasEstimate + 50000n
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
        grade: promotion.grade,
        studentWallet: promotion.studentWallet,
        professorWallet: promotion.professorWallet,
        validatedNFTs: promotion.validatedNFTs.map(Number), // ✅ ACTUALIZADO
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