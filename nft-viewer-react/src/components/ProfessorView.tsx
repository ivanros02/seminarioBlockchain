// components/ProfessorView.tsx
import React, { useState } from 'react';
import { useProfessor } from '../hooks/useProfessor';
import { AlchemyService } from '../services/alchemyService';
import { ContractService } from '../services/contractService';
import NFTCard from './NFTCard';
import { PromotionSection } from './PromotionSection'; // ✅ Importar PromotionSection
import type { ProfessorNFT } from '../services/professorService';
import type { NFT } from '../types/NFT';
import '../styles/ProfessorView.css'
interface ProfessorViewProps {
    walletAddress: string;
}

export const ProfessorView = ({ walletAddress }: ProfessorViewProps) => {
    const {
        professorData,
        loading,
        error,
        loadProfessorData,
    } = useProfessor();

    // Cargar datos al montar o cambiar wallet
    React.useEffect(() => {
        if (walletAddress) {
            loadProfessorData(walletAddress);
        }
    }, [walletAddress, loadProfessorData]);

    if (loading) {
        return (
            <div className="professor-view loading">
                <div className="loading-content">
                    <span className="loading-spinner">⏳</span>
                    <p>Cargando datos del profesor...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="professor-view error">
                <div className="error-content">
                    <span className="error-icon">❌</span>
                    <p>Error: {error}</p>
                    <button onClick={() => loadProfessorData(walletAddress)}>
                        🔄 Reintentar
                    </button>
                </div>
            </div>
        );
    }

    if (!professorData?.isProfessor) {
        return null; // No mostrar nada si no es profesor
    }

    return (
        <div className="professor-view">
            {/* Header del profesor */}
            <div className="professor-header">
                <div className="professor-info">
                    <h2 className="professor-title">
                        👨‍🏫 Panel del Profesor {professorData.professorName}
                    </h2>
                    <p className="professor-wallet">
                        Wallet: {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                    </p>
                </div>

                <div className="professor-stats">
                    <div className="stat-item">
                        <span className="stat-number">{professorData.nfts.length}</span>
                        <span className="stat-label">Certificados TP</span>
                    </div>
                    <div className="stat-item">
                        <span className={`status-badge ${professorData.canPromote ? 'active' : 'inactive'}`}>
                            {professorData.canPromote ? '✅ Puede Promocionar' : '❌ Sin Permisos'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Lista de NFTs TP */}
            {professorData.nfts.length > 0 ? (
                <div className="tp-certificates-section">
                    <h3 className="section-title">📋 Certificados TP Recibidos</h3>

                    <div className="certificates-grid">
                        {professorData.nfts.map((nft) => (
                            <CertificateCard
                                key={nft.tokenId}
                                nft={nft}
                                professorWallet={walletAddress} // ✅ Pasar wallet del profesor
                                canPromote={professorData.canPromote}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="no-certificates">
                    <div className="empty-state">
                        <span className="empty-icon">📋</span>
                        <h3>No tienes certificados TP</h3>
                        <p>Los estudiantes deben mintear NFTs TP para que aparezcan aquí.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// Componente para cada certificado individual
interface CertificateCardProps {
    nft: ProfessorNFT;
    professorWallet: string; // ✅ Wallet del profesor
    canPromote: boolean;
}

const CertificateCard = ({ nft, professorWallet, canPromote }: CertificateCardProps) => {
    const { certificate } = nft;
    const [showUNQNFTs, setShowUNQNFTs] = useState(false);
    const [unqNFTs, setUnqNFTs] = useState<NFT[]>([]);
    const [loadingUNQ, setLoadingUNQ] = useState(false);
    const [loadedCount, setLoadedCount] = useState(0);
    const [errorUNQ, setErrorUNQ] = useState<string | null>(null);

    // ✅ Función para cargar NFTs UNQ usando tu lógica existente
    const handleToggleUNQNFTs = async () => {
        if (!showUNQNFTs && unqNFTs.length === 0) {
            setLoadingUNQ(true);
            setErrorUNQ(null);
            setLoadedCount(0);

            try {
                console.log('🔍 Cargando NFTs UNQ para IDs:', certificate.unqTokenIds);

                const loadedNFTs: NFT[] = [];

                // Cargar cada NFT UNQ usando tu AlchemyService existente
                for (let i = 0; i < certificate.unqTokenIds.length; i++) {
                    const tokenId = certificate.unqTokenIds[i];

                    try {
                        console.log(`📦 Cargando NFT UNQ #${tokenId}...`);

                        // ✅ Paso 1: Obtener metadata básica de Alchemy
                        const metadata = await AlchemyService.getNFTMetadata(tokenId.toString());

                        // ✅ Paso 2: Obtener datos específicos del contrato
                        const { clase, tema, alumno } = await ContractService.getDatosDeClases(tokenId);

                        // ✅ Paso 3: Combinar datos
                        const nftData: NFT = {
                            tokenId: tokenId,
                            name: metadata?.metadata?.name || "Sin nombre",
                            description: metadata?.metadata?.description || "Sin descripción",
                            image: metadata?.media?.[0]?.gateway || metadata?.metadata?.image || "",
                            clase,
                            tema,
                            alumno
                        };

                        loadedNFTs.push(nftData);
                        console.log(`✅ NFT UNQ #${tokenId} cargado:`, { clase, tema, alumno });
                        setLoadedCount(i + 1);

                        // Pausa para no sobrecargar la API
                        await new Promise(resolve => setTimeout(resolve, 300));

                    } catch (tokenError) {
                        console.error(`❌ Error cargando NFT #${tokenId}:`, tokenError);

                        // NFT de error
                        const errorNFT: NFT = {
                            tokenId: tokenId,
                            name: `NFT UNQ #${tokenId}`,
                            description: 'Error cargando NFT',
                            image: '',
                            clase: 'Error',
                            tema: 'Error',
                            alumno: 'Error'
                        };

                        loadedNFTs.push(errorNFT);
                        setLoadedCount(i + 1);
                    }
                }

                setUnqNFTs(loadedNFTs);
                console.log(`🎉 Cargados ${loadedNFTs.length}/${certificate.unqTokenIds.length} NFTs UNQ`);

            } catch (error) {
                console.error('❌ Error general cargando NFTs UNQ:', error);
                setErrorUNQ(error instanceof Error ? error.message : 'Error desconocido');
            } finally {
                setLoadingUNQ(false);
            }
        }

        setShowUNQNFTs(!showUNQNFTs);
    };

    return (
        <div className="certificate-card">
            <div className="card-header">
                <h4 className="student-name"> {certificate.studentName}</h4>
                <span className="token-badge">Token #{certificate.tokenId}</span>
            </div>

            <div className="card-content">
                <div className="certificate-info">
                    <div className="info-row">
                        <span className="info-label">📅 Fecha:</span>
                        <span className="info-value">{certificate.completionDate}</span>
                    </div>

                    <div className="info-row">
                        <span className="info-label">💼 Estudiante:</span>
                        <span className="info-value mono">
                            {certificate.studentWallet.slice(0, 8)}...{certificate.studentWallet.slice(-6)}
                        </span>
                    </div>

                    <div className="info-row">
                        <span className="info-label">🕐 Minteado:</span>
                        <span className="info-value">{certificate.mintDate}</span>
                    </div>
                </div>

                <div className="unq-preview">
                    <div className="unq-header">
                        <p className="unq-title">📦 NFTs UNQ ({certificate.unqTokenIds.length}):</p>
                        <button
                            className="expand-btn"
                            onClick={handleToggleUNQNFTs}
                            disabled={loadingUNQ}
                        >
                            {loadingUNQ ? (
                                <>⏳ Cargando... {loadedCount}/{certificate.unqTokenIds.length}</>
                            ) : showUNQNFTs ? (
                                <>🔽 Contraer NFTs</>
                            ) : (
                                <>🔼 Ver NFTs Completos</>
                            )}
                        </button>
                    </div>

                    {!showUNQNFTs ? (
                        // ✅ Vista compacta
                        <div className="unq-ids">
                            {certificate.unqTokenIds.slice(0, 5).map((id, index) => (
                                <span key={index} className="unq-id">#{id}</span>
                            ))}
                            {certificate.unqTokenIds.length > 5 && (
                                <span className="unq-more">+{certificate.unqTokenIds.length - 5} más</span>
                            )}
                        </div>
                    ) : (
                        // ✅ Vista expandida con NFTCards
                        <div className="unq-expanded">
                            {loadingUNQ && (
                                <div className="loading-nfts">
                                    <p>Cargando NFTs UNQ... {loadedCount}/{certificate.unqTokenIds.length}</p>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${(loadedCount / certificate.unqTokenIds.length) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {errorUNQ && (
                                <div className="error-loading">
                                    <p>⚠️ Error cargando algunos NFTs: {errorUNQ}</p>
                                </div>
                            )}

                            {unqNFTs.length > 0 && (
                                <div className="unq-nfts-grid">
                                    {unqNFTs.map((unqNFT) => (
                                        <div key={unqNFT.tokenId} className="unq-nft-wrapper">
                                            <NFTCard nft={unqNFT} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ✅ NUEVA SECCIÓN DE PROMOCIÓN */}
                <div className="card-promotion">
                    <PromotionSection
                        professorWallet={professorWallet}
                        canPromote={canPromote}
                        studentWallet={certificate.studentWallet}
                        studentName={certificate.studentName}
                        tokenIds={certificate.unqTokenIds}
                    />
                </div>
            </div>


        </div>
    );
};