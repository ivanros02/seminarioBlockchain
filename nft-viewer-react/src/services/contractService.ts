import { BrowserProvider, Contract } from "ethers";
import { CONTRATO_ADDRESS, CONTRACT_ABI } from "../constants/nftConstants";

export class ContractService {
  private static async getContract() {
    const provider = new BrowserProvider(window.ethereum as any);
    return new Contract(CONTRATO_ADDRESS, CONTRACT_ABI, provider);
  }

  static async getDatosDeClases(tokenId: number) {
    try {
      const contract = await this.getContract();
      const [clase, tema, alumno] = await contract.datosDeClases(tokenId);
      return {
        clase: clase.toString(),
        tema,
        alumno
      };
    } catch {
      return {
        clase: "No definido",
        tema: "No definido",
        alumno: "Sin alumno"
      };
    }
  }
}