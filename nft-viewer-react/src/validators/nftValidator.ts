import { AlchemyService } from "../services/alchemyService";
import type { NFTValidationDetail, ValidationResult } from "../types/validation";

export class NFTValidator {
  // ✅ Fecha límite: 28/05/2025 (CORREGIDA)
  private static readonly CUTOFF_DATE = new Date("2025-05-28T23:59:59Z");

  /**
   * ✅ VALIDACIÓN PRINCIPAL - Los 3 requisitos esenciales
   */
  static async validateNFTsStrict(address: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: false,
      hasExactly10NFTs: false,
      allNFTsValid: false,
      validMintDates: false,
      invalidNFTs: [],
      errors: [],
      nftDetails: []
    };

    try {
      console.log(`🚀 Validando wallet ${address}`);

      // ✅ REQUISITO 1: Verificar exactamente 10 NFTs UNQ
      const nfts = await AlchemyService.getNFTsByOwner(address);
      console.log(`📦 Encontrados ${nfts.length} NFTs del contrato UNQ`);

      result.hasExactly10NFTs = nfts.length === 10;
      if (!result.hasExactly10NFTs) {
        result.errors.push(`❌ Se requieren exactamente 10 NFTs UNQ. Encontrados: ${nfts.length}`);
        return result;
      }

      console.log(`✅ REQUISITO 1: Tiene exactamente 10 NFTs ✓`);

      // ✅ REQUISITOS 2 y 3: Validar cada NFT individualmente
      const validationPromises = nfts.map(async (nft: any) => {
        const tokenId = parseInt(nft.id.tokenId, 16);
        return await this.validateSingleNFT(tokenId, address);
      });

      const validationDetails = await Promise.all(validationPromises);
      result.nftDetails = validationDetails;

      // Contar NFTs válidos
      const validTransfers = validationDetails.filter(d => d.noRetransfer);
      const validDates = validationDetails.filter(d => d.validMintDate);

      result.allNFTsValid = validTransfers.length === nfts.length;
      result.validMintDates = validDates.length === nfts.length;

      console.log(`📊 REQUISITO 2: ${validTransfers.length}/${nfts.length} NFTs sin retransferir`);
      console.log(`📊 REQUISITO 3: ${validDates.length}/${nfts.length} NFTs con fecha válida`);

      // Reportar NFTs inválidos
      validationDetails.forEach(detail => {
        if (!detail.noRetransfer) {
          result.invalidNFTs.push(`Token ${detail.tokenId}: Retransferido`);
        }
        if (!detail.validMintDate) {
          result.invalidNFTs.push(`Token ${detail.tokenId}: Fecha de mint inválida (después del 28/05/2025)`);
        }
      });

      // ✅ RESULTADO FINAL
      result.isValid = result.hasExactly10NFTs && result.allNFTsValid && result.validMintDates;

      console.log(`🎯 VALIDACIÓN FINAL: ${result.isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
      console.log(`   - 10 NFTs: ${result.hasExactly10NFTs ? '✅' : '❌'}`);
      console.log(`   - Sin retransferir: ${result.allNFTsValid ? '✅' : '❌'}`);
      console.log(`   - Fechas válidas: ${result.validMintDates ? '✅' : '❌'}`);

      return result;

    } catch (error) {
      console.error("❌ Error en validación:", error);
      result.errors.push(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return result;
    }
  }

  /**
   * ✅ VALIDACIÓN DE UN SOLO NFT
   */
  private static async validateSingleNFT(tokenId: number, ownerAddress: string): Promise<NFTValidationDetail> {
    const detail: NFTValidationDetail = {
      tokenId,
      noRetransfer: false,
      validMintDate: false,
      transferCount: 0,
      mintCount: 0,
      errors: []
    };

    try {
      console.log(`🔍 Validando Token ${tokenId}...`);

      // ✅ REQUISITO 2 y 3: Analizar transferencias y fechas (LÓGICA ORIGINAL)
      const transferAnalysis = await AlchemyService.analyzeTokenTransfers(tokenId.toString());
      
      console.log(`🐛 DEBUG Token ${tokenId}:`, {
        mintTransferExists: !!transferAnalysis.mintTransfer,
        mintTimestampRaw: transferAnalysis.mintTimestamp,
        mintTimestampType: typeof transferAnalysis.mintTimestamp,
        mintTimestampDate: transferAnalysis.mintTimestamp 
          ? new Date(transferAnalysis.mintTimestamp * 1000).toISOString()
          : 'null'
      });

      detail.mintCount = transferAnalysis.mintTransfer ? 1 : 0;
      detail.transferCount = transferAnalysis.nonMintTransfers.length;

      // ✅ VALIDACIÓN 2: No Retransferencia
      const hasValidMint = detail.mintCount === 1;
      
      if (!hasValidMint) {
        detail.errors.push(`❌ No tiene evento de mint válido`);
        detail.noRetransfer = false;
      } else {
        // Verificar si el usuario actual transfirió el NFT
        const userTransfersOut = transferAnalysis.nonMintTransfers.filter((transfer: any) => {
          return transfer.from?.toLowerCase() === ownerAddress.toLowerCase();
        });

        detail.noRetransfer = userTransfersOut.length === 0;

        if (detail.noRetransfer) {
          detail.errors.push(`✅ NFT válido: usuario no lo transfirió`);
        } else {
          detail.errors.push(`❌ Usuario transfirió este NFT ${userTransfersOut.length} vez(es)`);
        }
      }

      // ✅ VALIDACIÓN 3: Fecha de Emisión (LÓGICA ORIGINAL)
      if (transferAnalysis.mintTransfer && transferAnalysis.mintTimestamp) {
        const mintDate = new Date(transferAnalysis.mintTimestamp * 1000);
        detail.mintDate = mintDate.toISOString();
        detail.validMintDate = mintDate < this.CUTOFF_DATE;

        console.log(`🕐 Token ${tokenId} - Mint: ${mintDate.toLocaleDateString()} ${mintDate.toLocaleTimeString()}, Válido: ${detail.validMintDate}`);

        detail.errors.push(
          detail.validMintDate 
            ? `✅ Mint: ${mintDate.toLocaleDateString()} (antes del 28/05/2025)` 
            : `❌ Mint: ${mintDate.toLocaleDateString()} (después del 28/05/2025)`
        );
      } else {
        console.log(`❌ Token ${tokenId} - No se pudo obtener timestamp de mint`);
        detail.errors.push(`❌ No se pudo verificar fecha de mint`);
        detail.validMintDate = false;
      }

      console.log(`🎯 Token ${tokenId} RESULTADO:`);
      console.log(`   - No retransferido: ${detail.noRetransfer ? '✅' : '❌'}`);
      console.log(`   - Fecha válida: ${detail.validMintDate ? '✅' : '❌'}`);

      return detail;

    } catch (error) {
      console.error(`❌ Error validando token ${tokenId}:`, error);
      detail.errors.push(`❌ Error: ${error}`);
      detail.noRetransfer = false;
      detail.validMintDate = false;
      return detail;
    }
  }
}