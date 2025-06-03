import type { NFT } from "../types/NFT";
import { AlchemyService } from "./alchemyService";
import { ContractService } from "./contractService";

export class NFTLoader {
  static async loadNFTs(address: string): Promise<NFT[]> {
    const nfts = await AlchemyService.getNFTsByOwner(address);

    const procesados: NFT[] = await Promise.all(
      nfts.map(async (nft: any) => {
        const tokenId = parseInt(nft.id.tokenId, 16);
        const nombre = nft.metadata?.name || "Sin nombre";
        const imagen = nft.media?.[0]?.gateway || nft.metadata?.image || "";
        const descripcion = nft.metadata?.description || "Sin descripción";

        const { clase, tema, alumno } = await ContractService.getDatosDeClases(tokenId);

        return { 
          name: nombre, 
          description: descripcion, 
          image: imagen, 
          tokenId, 
          clase, 
          tema, 
          alumno 
        };
      })
    );

    return procesados;
  }
}