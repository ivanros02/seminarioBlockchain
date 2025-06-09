// services/professorService.ts
import { ethers } from 'ethers';
import { TP_CONTRACT_ADDRESS, TP_CONTRACT_ABI, type CertificateInfo } from '../constants/tpConstants';

// ✅ Re-exportar CertificateInfo para que esté disponible
export type { CertificateInfo } from '../constants/tpConstants';

// 🎓 Wallets de profesores
export const PROFESSOR_WALLETS = {
    PABLO: "0x96664195a728321F0F672B3BA29639eD727CE7a1",
    DANIEL: "0x81Bce31CaB4F37DdC8561550Ee7eaa859ca50581"
} as const;

export interface ProfessorNFT {
    tokenId: number;
    balance: number;
    certificate: CertificateInfo;
}

export interface ProfessorData {
    walletAddress: string;
    isProfessor: boolean;
    professorName: string;
    nfts: ProfessorNFT[];
    hasTPNFT: boolean;
    canPromote: boolean;
}

export class ProfessorService {

    /**
     * 🔍 Verificar si una wallet es de profesor
     *  

             static isProfessorWallet(walletAddress: string): boolean {
      const address = walletAddress.toLowerCase();
      return address === PROFESSOR_WALLETS.PABLO.toLowerCase() || 
             address === PROFESSOR_WALLETS.DANIEL.toLowerCase();
    }
    }
     * 
     */

    static isProfessorWallet(walletAddress: string): boolean {
      const address = walletAddress.toLowerCase();
      return address === PROFESSOR_WALLETS.PABLO.toLowerCase() || 
             address === PROFESSOR_WALLETS.DANIEL.toLowerCase();
    }



    /**
     * 👤 Obtener nombre del profesor
     */
    static getProfessorName(walletAddress: string): string {
        const address = walletAddress.toLowerCase();
        if (address === PROFESSOR_WALLETS.PABLO.toLowerCase()) return "Pablo";
        if (address === PROFESSOR_WALLETS.DANIEL.toLowerCase()) return "Daniel";
        return "Desconocido";
    }

    /**
     * 📋 Obtener NFTs TP del profesor
     */
    static async getProfessorTPNFTs(walletAddress: string): Promise<ProfessorNFT[]> {
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask no disponible');
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(TP_CONTRACT_ADDRESS, TP_CONTRACT_ABI, provider);

            // Obtener total supply para iterar
            const totalSupply = await contract.totalSupply();
            const professorNFTs: ProfessorNFT[] = [];

            // Iterar por todos los tokens para encontrar los del profesor
            for (let tokenId = 1; tokenId <= Number(totalSupply); tokenId++) {
                try {
                    // Verificar balance del profesor para este token
                    const balance = await contract.balanceOf(walletAddress, tokenId);

                    if (Number(balance) > 0) {
                        // El profesor tiene este NFT, obtener certificado
                        const certificate = await contract.getCertificate(tokenId);

                        const professorNFT: ProfessorNFT = {
                            tokenId,
                            balance: Number(balance),
                            certificate: {
                                tokenId,
                                studentName: certificate.studentName,
                                completionDate: certificate.completionDate,
                                studentWallet: certificate.studentWallet,
                                unqTokenIds: certificate.unqTokenIds.map((id: any) => Number(id)),
                                mintTimestamp: Number(certificate.mintTimestamp),
                                exists: certificate.exists,
                                mintDate: new Date(Number(certificate.mintTimestamp) * 1000).toISOString().split('T')[0]
                            }
                        };

                        professorNFTs.push(professorNFT);
                    }
                } catch (tokenError) {
                    // Token no existe o error, continuar
                    continue;
                }
            }

            return professorNFTs;

        } catch (error) {
            console.error('❌ Error obteniendo NFTs del profesor:', error);
            return [];
        }
    }

    /**
     * 🎓 Obtener datos completos del profesor
     */
    static async getProfessorData(walletAddress: string): Promise<ProfessorData> {
        const isProfessor = this.isProfessorWallet(walletAddress);

        if (!isProfessor) {
            return {
                walletAddress,
                isProfessor: false,
                professorName: "",
                nfts: [],
                hasTPNFT: false,
                canPromote: false
            };
        }

        const professorName = this.getProfessorName(walletAddress);
        const nfts = await this.getProfessorTPNFTs(walletAddress);
        const hasTPNFT = nfts.length > 0;
        const canPromote = hasTPNFT; // Puede promocionar si tiene al menos un NFT TP

        return {
            walletAddress,
            isProfessor: true,
            professorName,
            nfts,
            hasTPNFT,
            canPromote
        };
    }

    /**
     * 🎯 Acción de promocionar (placeholder)
     */
    static async promoteStudent(professorWallet: string, studentCertificate: CertificateInfo): Promise<boolean> {
        try {
            console.log('🎓 Promocionando estudiante:', {
                profesor: this.getProfessorName(professorWallet),
                estudiante: studentCertificate.studentName,
                tokenId: studentCertificate.tokenId
            });

            // Aquí puedes implementar la lógica de promoción
            // Por ejemplo: crear un nuevo NFT de "Promoción", actualizar base de datos, etc.

            // Simulación de promoción exitosa
            await new Promise(resolve => setTimeout(resolve, 2000));

            return true;
        } catch (error) {
            console.error('❌ Error promocionando estudiante:', error);
            return false;
        }
    }
}