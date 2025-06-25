// services/professorService.ts
import { ethers } from 'ethers';
import { TP_CONTRACT_ADDRESS, TP_CONTRACT_ABI, type CertificateInfo } from '../constants/tpConstants';
import { PromotionService, type PromotionRequest, type PromotionResult } from './promotionService';

// ✅ Re-exportar tipos
export type { CertificateInfo } from '../constants/tpConstants';
export type { PromotionResult } from './promotionService';

// 🎓 Wallets de profesores
export const PROFESSOR_WALLETS = {
    PABLO: "0x96664195a728321F0F672B3BA29639eD727CE7a1",
    DANIEL: "0x81Bce31CaB4F37DdC8561550Ee7eaa859ca50581",
    TEST: "0x05788623D682889fc8F4024718Be8ec2b0bCe77B"
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
     */
    static isProfessorWallet(walletAddress: string): boolean {
        const address = walletAddress.toLowerCase();
        return address === PROFESSOR_WALLETS.PABLO.toLowerCase() ||
            address === PROFESSOR_WALLETS.DANIEL.toLowerCase() ||
            address === PROFESSOR_WALLETS.TEST.toLowerCase();
    }

    /**
     * 👤 Obtener nombre del profesor
     */
    static getProfessorName(walletAddress: string): string {
        const address = walletAddress.toLowerCase();
        if (address === PROFESSOR_WALLETS.PABLO.toLowerCase()) return "Pablo";
        if (address === PROFESSOR_WALLETS.DANIEL.toLowerCase()) return "Daniel";
        if (address === PROFESSOR_WALLETS.TEST.toLowerCase()) return "Test";
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

            console.log('🔍 Verificando contrato TP:', TP_CONTRACT_ADDRESS);


            const totalSupply = await contract.totalSupply();
            const professorNFTs: ProfessorNFT[] = [];

            for (let tokenId = 1; tokenId <= Number(totalSupply); tokenId++) {
                try {
                    const balance = await contract.balanceOf(walletAddress, tokenId);

                    if (Number(balance) > 0) {
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

        // ✅ Verificar si puede promocionar usando el servicio de promoción
        const canPromoteFromContract = await PromotionService.canProfessorPromote(walletAddress);
        const canPromote = hasTPNFT && canPromoteFromContract;

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
     * 🎯 Promocionar estudiante - ACTUALIZADO con claimedTokenIds
     */
    static async promoteStudent(
        professorWallet: string,
        studentWallet: string,
        studentName: string,
        promotionText: string,
        grade: string,
        claimedTokenIds: number[] = [8, 16, 25, 34, 42, 49, 56, 63, 70, 77] // ✅ NUEVO PARÁMETRO con valores por defecto
    ): Promise<PromotionResult> {
        try {
            console.log('🎓 Iniciando promoción de estudiante:', {
                profesor: this.getProfessorName(professorWallet),
                estudiante: studentName,
                texto: promotionText,
                nota: grade,
                nftsReclamados: claimedTokenIds // ✅ AGREGADO AL LOG
            });

            // ✅ Verificar que el profesor puede promocionar
            const canPromote = await PromotionService.canProfessorPromote(professorWallet);
            if (!canPromote) {
                throw new Error('Profesor no autorizado o no tiene NFT TP requerido');
            }

            // ✅ Crear request de promoción - ACTUALIZADO con claimedTokenIds
            const promotionRequest: PromotionRequest = {
                studentWallet,
                studentName,
                promotionText,
                grade,
                claimedTokenIds // ✅ CAMPO OBLIGATORIO AGREGADO
            };

            // ✅ Ejecutar promoción a través del servicio
            const result = await PromotionService.promoteStudent(promotionRequest);

            if (result.success) {
                console.log('🎉 Promoción exitosa:', result);
            } else {
                console.error('❌ Error en promoción:', result.error);
            }

            return result;

        } catch (error) {
            console.error('❌ Error promocionando estudiante:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * 📊 Obtener estadísticas del profesor
     */
    static async getProfessorStats(walletAddress: string): Promise<{
        totalTPCertificates: number;
        totalPromotions: number;
        canPromote: boolean;
    }> {
        try {
            const professorData = await this.getProfessorData(walletAddress);

            const totalTPCertificates = professorData.nfts.length;

            let totalPromotions = 0;
            try {
                // TODO: Implementar getProfessorPromotions en PromotionService
                // totalPromotions = await PromotionService.getProfessorPromotions(walletAddress);
            } catch {
                totalPromotions = 0;
            }

            return {
                totalTPCertificates,
                totalPromotions,
                canPromote: professorData.canPromote
            };

        } catch (error) {
            console.error('❌ Error obteniendo estadísticas del profesor:', error);
            return {
                totalTPCertificates: 0,
                totalPromotions: 0,
                canPromote: false
            };
        }
    }

    /**
     * 🎯 Promocionar estudiante con validación completa - ACTUALIZADO
     */
    static async promoteStudentWithValidation(
        professorWallet: string,
        studentWallet: string,
        studentName: string,
        promotionText: string,
        grade: string,
        claimedTokenIds: number[] = [8, 16, 25, 34, 42, 49, 56, 63, 70, 77] // ✅ NUEVO PARÁMETRO
    ): Promise<PromotionResult> {
        try {
            // ✅ Validaciones de entrada
            if (!grade || grade.trim().length === 0) {
                throw new Error('La nota es requerida');
            }

            if (grade.length > 50) {
                throw new Error('La nota no puede exceder 50 caracteres');
            }

            if (!claimedTokenIds || claimedTokenIds.length === 0) {
                throw new Error('Debe especificar al menos un NFT que el estudiante posee');
            }

            // ✅ Validar formato de nota si es numérica
            const numericGrade = parseFloat(grade);
            if (!isNaN(numericGrade)) {
                if (numericGrade < 0 || numericGrade > 100) {
                    console.warn('⚠️ Nota numérica fuera del rango típico 0-100:', numericGrade);
                }
            }

            // ✅ Pre-validar NFTs del estudiante
            const nftValidation = await PromotionService.validateStudentNFTs(studentWallet, claimedTokenIds);
            if (!nftValidation.isValid) {
                throw new Error(
                    `Estudiante no posee los siguientes NFTs: ${nftValidation.invalidIds.join(', ')}`
                );
            }

            // ✅ Proceder con la promoción incluyendo claimedTokenIds
            return await this.promoteStudent(
                professorWallet,
                studentWallet,
                studentName,
                promotionText,
                grade,
                claimedTokenIds // ✅ PASAR PARÁMETRO
            );

        } catch (error) {
            console.error('❌ Error en validación de promoción:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * 🔍 NUEVA FUNCIÓN: Validar NFTs de estudiante
     */
    static async validateStudentNFTs(
        studentWallet: string,
        claimedTokenIds: number[]
    ): Promise<{ isValid: boolean; invalidIds: number[] }> {
        try {
            return await PromotionService.validateStudentNFTs(studentWallet, claimedTokenIds);
        } catch (error) {
            console.error('❌ Error validando NFTs desde ProfessorService:', error);
            return { isValid: false, invalidIds: claimedTokenIds };
        }
    }

    /**
     * 🎓 NUEVA FUNCIÓN: Obtener NFTs de ejemplo para un estudiante
     */
    static getDefaultClaimedTokenIds(): number[] {
        return [8, 16, 25, 34, 42, 49, 56, 63, 70, 77];
    }

    /**
     * 📝 NUEVA FUNCIÓN: Formatear nota para mostrar
     */
    static formatGrade(grade: string): string {
        // Si es un número, formatear con decimales apropiados
        const numericGrade = parseFloat(grade);
        if (!isNaN(numericGrade)) {
            return numericGrade % 1 === 0 ? numericGrade.toString() : numericGrade.toFixed(1);
        }

        // Si no es numérico, devolver tal como está
        return grade.trim();
    }

    /**
     * ✅ NUEVA FUNCIÓN: Validar formato de nota
     */
    static validateGradeFormat(grade: string): { isValid: boolean; message?: string } {
        if (!grade || grade.trim().length === 0) {
            return { isValid: false, message: 'La nota es requerida' };
        }

        if (grade.length > 50) {
            return { isValid: false, message: 'La nota no puede exceder 50 caracteres' };
        }

        // Verificar si contiene caracteres especiales problemáticos
        const invalidChars = /[<>'"&]/;
        if (invalidChars.test(grade)) {
            return { isValid: false, message: 'La nota contiene caracteres no permitidos' };
        }

        return { isValid: true };
    }
}