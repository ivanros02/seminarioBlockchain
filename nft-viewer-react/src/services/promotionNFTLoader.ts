// services/promotionNFTLoader.ts
import { ethers } from 'ethers';

// ✅ Dirección del contrato de promoción cambiar en produccion
//test 0x0e6586512ba0e1395C4576267CC8c62f5a4EA18C
// test 2 0xcdfB098192a9714D9338E35A887bcf8286833EdF
export const PROMOTION_CONTRACT_ADDRESS = "0xcdfB098192a9714D9338E35A887bcf8286833EdF";

// ✅ ABI mínimo necesario para leer promociones
export const PROMOTION_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "balanceOf",
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

// ✅ Tipo para NFT de promoción
export interface PromotionNFT {
  tokenId: number;
  studentName: string;
  promotionText: string;
  professorName: string;
  promotionDate: string;
  balance: number;
  type: 'promotion'; // ✅ Para distinguir del tipo 'unq'
}

export class PromotionNFTLoader {
  
  /**
   * 🎓 Cargar NFTs de promoción para un estudiante
   */
  static async loadPromotionNFTs(studentAddress: string): Promise<PromotionNFT[]> {
    try {
      console.log('🎓 Cargando NFTs de promoción para:', studentAddress);

      if (!window.ethereum) {
        console.log('❌ MetaMask no disponible');
        return [];
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(PROMOTION_CONTRACT_ADDRESS, PROMOTION_CONTRACT_ABI, provider);

      // ✅ Paso 1: Obtener token IDs de promociones del estudiante
      const tokenIds = await contract.getStudentPromotions(studentAddress);
      console.log('📋 Token IDs de promociones encontrados:', tokenIds);

      if (tokenIds.length === 0) {
        console.log('📭 No hay promociones para este estudiante');
        return [];
      }

      // ✅ Paso 2: Cargar datos de cada promoción
      const promotionNFTs: PromotionNFT[] = [];

      for (const tokenId of tokenIds) {
        try {
          const tokenIdNum = Number(tokenId);
          
          // Verificar balance (debería ser 1 si el estudiante lo tiene)
          const balance = await contract.balanceOf(studentAddress, tokenIdNum);
          
          if (Number(balance) > 0) {
            // Obtener datos completos de la promoción
            const promotionData = await contract.getPromotion(tokenIdNum);
            
            const promotionNFT: PromotionNFT = {
              tokenId: tokenIdNum,
              studentName: promotionData.studentName,
              promotionText: promotionData.promotionText,
              professorName: promotionData.professorName,
              promotionDate: new Date(Number(promotionData.promotionTimestamp) * 1000).toISOString().split('T')[0],
              balance: Number(balance),
              type: 'promotion'
            };

            promotionNFTs.push(promotionNFT);
            console.log(`✅ Promoción cargada: Token #${tokenIdNum} por ${promotionData.professorName}`);
          }
        } catch (tokenError) {
          console.error(`❌ Error cargando token ${tokenId}:`, tokenError);
        }
      }

      console.log(`🎉 Total promociones cargadas: ${promotionNFTs.length}`);
      return promotionNFTs;

    } catch (error) {
      console.error('❌ Error cargando NFTs de promoción:', error);
      return [];
    }
  }

  /**
   * 🔍 Verificar si el estudiante tiene promociones
   */
  static async hasPromotions(studentAddress: string): Promise<boolean> {
    try {
      const promotions = await this.loadPromotionNFTs(studentAddress);
      return promotions.length > 0;
    } catch (error) {
      console.error('❌ Error verificando promociones:', error);
      return false;
    }
  }

  /**
   * 📊 Obtener estadísticas de promociones
   */
  static async getPromotionStats(studentAddress: string): Promise<{
    totalPromotions: number;
    professorsList: string[];
    latestPromotion?: PromotionNFT;
  }> {
    try {
      const promotions = await this.loadPromotionNFTs(studentAddress);
      
      const professorsList = [...new Set(promotions.map(p => p.professorName))];
      const latestPromotion = promotions.sort((a, b) => b.tokenId - a.tokenId)[0];

      return {
        totalPromotions: promotions.length,
        professorsList,
        latestPromotion
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        totalPromotions: 0,
        professorsList: [],
        latestPromotion: undefined
      };
    }
  }
}