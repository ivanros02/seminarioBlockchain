// services/promotionNFTLoader.ts
import { ethers } from 'ethers';

// ✅ Dirección del contrato de promoción cambiar en produccion
//test con nota 0x1897D7115Aa6428FFb76a9B2ed09ba3e50cef2E7
export const PROMOTION_CONTRACT_ADDRESS = "0x1545f699db914A6D1e508354502676d3A0176897";

// ✅ ABI mínimo necesario para leer promociones - ACTUALIZADO CON GRADE
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
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getPromotionGrade",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
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

// ✅ Tipo para NFT de promoción - ACTUALIZADO CON GRADE
export interface PromotionNFT {
  tokenId: number;
  studentName: string;
  promotionText: string;
  grade: string; // ✅ AGREGADO
  professorName: string;
  promotionDate: string;
  balance: number;
  type: 'promotion'; // ✅ Para distinguir del tipo 'unq'
}

export class PromotionNFTLoader {
  
  /**
   * 🎓 Cargar NFTs de promoción para un estudiante - ACTUALIZADO CON GRADE
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
              grade: promotionData.grade, // ✅ AGREGADO
              professorName: promotionData.professorName,
              promotionDate: new Date(Number(promotionData.promotionTimestamp) * 1000).toISOString().split('T')[0],
              balance: Number(balance),
              type: 'promotion'
            };

            promotionNFTs.push(promotionNFT);
            console.log(`✅ Promoción cargada: Token #${tokenIdNum} por ${promotionData.professorName} - Nota: ${promotionData.grade}`);
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
   * 📊 Obtener estadísticas de promociones - ACTUALIZADO CON GRADES
   */
  static async getPromotionStats(studentAddress: string): Promise<{
    totalPromotions: number;
    professorsList: string[];
    gradesList: string[]; // ✅ AGREGADO
    averageGradeInfo: { hasNumericGrades: boolean; average?: number }; // ✅ AGREGADO
    latestPromotion?: PromotionNFT;
  }> {
    try {
      const promotions = await this.loadPromotionNFTs(studentAddress);
      
      const professorsList = [...new Set(promotions.map(p => p.professorName))];
      const gradesList = [...new Set(promotions.map(p => p.grade))]; // ✅ AGREGADO
      const latestPromotion = promotions.sort((a, b) => b.tokenId - a.tokenId)[0];

      // ✅ AGREGADO: Calcular promedio si las notas son numéricas
      const averageGradeInfo = this.calculateAverageGrade(promotions);

      return {
        totalPromotions: promotions.length,
        professorsList,
        gradesList, // ✅ AGREGADO
        averageGradeInfo, // ✅ AGREGADO
        latestPromotion
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        totalPromotions: 0,
        professorsList: [],
        gradesList: [], // ✅ AGREGADO
        averageGradeInfo: { hasNumericGrades: false }, // ✅ AGREGADO
        latestPromotion: undefined
      };
    }
  }

  /**
   * 🧮 NUEVA FUNCIÓN: Calcular promedio de notas si son numéricas
   */
  private static calculateAverageGrade(promotions: PromotionNFT[]): { hasNumericGrades: boolean; average?: number } {
    if (promotions.length === 0) {
      return { hasNumericGrades: false };
    }

    const numericGrades: number[] = [];
    
    for (const promotion of promotions) {
      const grade = parseFloat(promotion.grade);
      if (!isNaN(grade)) {
        numericGrades.push(grade);
      }
    }

    if (numericGrades.length === 0) {
      return { hasNumericGrades: false };
    }

    const average = numericGrades.reduce((sum, grade) => sum + grade, 0) / numericGrades.length;
    
    return {
      hasNumericGrades: true,
      average: Math.round(average * 100) / 100 // Redondear a 2 decimales
    };
  }

  /**
   * 🎯 NUEVA FUNCIÓN: Obtener solo la nota de una promoción específica
   */
  static async getPromotionGrade(tokenId: number): Promise<string | null> {
    try {
      if (!window.ethereum) {
        console.log('❌ MetaMask no disponible');
        return null;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(PROMOTION_CONTRACT_ADDRESS, PROMOTION_CONTRACT_ABI, provider);

      const grade = await contract.getPromotionGrade(tokenId);
      console.log(`📊 Nota obtenida para token #${tokenId}: ${grade}`);
      
      return grade;
    } catch (error) {
      console.error(`❌ Error obteniendo nota del token ${tokenId}:`, error);
      return null;
    }
  }

  /**
   * 🏆 NUEVA FUNCIÓN: Filtrar promociones por nota
   */
  static async getPromotionsByGrade(studentAddress: string, targetGrade: string): Promise<PromotionNFT[]> {
    try {
      const allPromotions = await this.loadPromotionNFTs(studentAddress);
      return allPromotions.filter(promotion => promotion.grade === targetGrade);
    } catch (error) {
      console.error('❌ Error filtrando promociones por nota:', error);
      return [];
    }
  }

  /**
   * 📈 NUEVA FUNCIÓN: Obtener mejores promociones (si las notas son comparables)
   */
  static async getTopPromotions(studentAddress: string, limit: number = 3): Promise<PromotionNFT[]> {
    try {
      const allPromotions = await this.loadPromotionNFTs(studentAddress);
      
      // Separar promociones con notas numéricas y no numéricas
      const numericPromotions = allPromotions.filter(p => !isNaN(parseFloat(p.grade)));
      const nonNumericPromotions = allPromotions.filter(p => isNaN(parseFloat(p.grade)));
      
      // Ordenar numéricas por valor descendente
      const sortedNumeric = numericPromotions.sort((a, b) => parseFloat(b.grade) - parseFloat(a.grade));
      
      // Para no numéricas, ordenar por fecha (más recientes primero)
      const sortedNonNumeric = nonNumericPromotions.sort((a, b) => b.tokenId - a.tokenId);
      
      // Combinar y limitar
      return [...sortedNumeric, ...sortedNonNumeric].slice(0, limit);
    } catch (error) {
      console.error('❌ Error obteniendo mejores promociones:', error);
      return [];
    }
  }
}