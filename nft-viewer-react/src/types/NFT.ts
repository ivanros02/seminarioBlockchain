export interface NFT {
  name: string;
  description: string;
  image: string;
  tokenId: number;
  clase: string;
  tema: string;
  alumno: string;
}

// ✅ Tipo para NFT de promoción
export interface PromotionNFT {
  tokenId: number;
  studentName: string;
  promotionText: string;
  professorName: string;
  promotionDate: string;
  balance: number;
  grade: string; // ✅ AGREGADO CAMPO PARA LA NOTA
  type: 'promotion'; // ✅ Identificador de tipo
}