import axios from "axios";
import { ALCHEMY_BASE_URL, CONTRATO_ADDRESS } from "../constants/nftConstants";

export class AlchemyService {
  static async getNFTsByOwner(address: string) {
    const url = `${ALCHEMY_BASE_URL}/getNFTs?owner=${address}&contractAddresses[]=${CONTRATO_ADDRESS}&withMetadata=true`;
    const response = await axios.get(url);
    return response.data.ownedNfts;
  }

  static async getOwnersForToken(tokenId: number) {
    const ownerUrl = `${ALCHEMY_BASE_URL}/getOwnersForToken?contractAddress=${CONTRATO_ADDRESS}&tokenId=${tokenId}`;
    const ownerResponse = await axios.get(ownerUrl);
    return ownerResponse.data.owners || [];
  }
}