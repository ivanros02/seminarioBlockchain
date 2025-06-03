import { useState, useCallback } from "react";
import NFTList from "./NFTList";
import { useNFTLoader } from "../hooks/useNFTLoader";
import "../styles/home.css";
import { toast } from 'react-toastify';

// 🎯 Componente para el estado de validación individual
const ValidationBadge = ({
    isValid,
    text,
    ariaLabel
}: {
    isValid: boolean;
    icon: string;
    text: string;
    ariaLabel: string;
}) => (
    <div
        className={`validation-badge ${isValid ? 'success' : 'error'}`}
        role="status"
        aria-label={ariaLabel}
    >
        <span className="badge-icon" aria-hidden="true">
            {isValid ? "✓" : "!"}
        </span>
        <span className="badge-text">
            {text}
        </span>
    </div>
);

// 🎯 Componente para el panel de validación completo
const ValidationPanel = ({
    validationResult,
    nftsCount,
    onMintTP
}: {
    validationResult: any;
    nftsCount: number;
    onMintTP: () => void;
}) => {
    if (!validationResult) return null;
    const [showMintBtn, setShowMintBtn] = useState(false);

    return (
        <div
            className={`validation-status ${validationResult.isValid ? 'valid' : 'invalid'}`}
            role="region"
            aria-labelledby="validation-header"
        >
            {/* 🎭 Header con icono y estado */}
            <div className="validation-header" id="validation-header">
                <span
                    className={`status-icon ${validationResult.isValid ? 'success' : 'error'}`}
                    aria-hidden="true"
                >
                    {validationResult.isValid ? "✅" : "❌"}
                </span>
                <span className="status-text">
                    {validationResult.isValid ? "Validación Exitosa" : "Validación Fallida"}
                </span>
            </div>

            {/* 📋 Badges de validación minimalistas */}
            <div className="validation-badges">
                <div className="badges-container" role="list" aria-label="Requisitos de validación">
                    <ValidationBadge
                        isValid={validationResult.hasExactly10NFTs}
                        icon="✓"
                        text={`${nftsCount}/10 NFTs`}
                        ariaLabel={`Cantidad de NFTs: ${nftsCount} de 10 requeridos${validationResult.hasExactly10NFTs ? ', válido' : ', inválido'}`}
                    />

                    <ValidationBadge
                        isValid={validationResult.allNFTsValid}
                        icon="✓"
                        text="No retransferidos"
                        ariaLabel={`Estado de transferencia: ${validationResult.allNFTsValid ? 'Todos son originales' : 'Algunos fueron transferidos'}`}
                    />

                    <ValidationBadge
                        isValid={validationResult.validMintDates}
                        icon="✓"
                        text="Fecha Mint"
                        ariaLabel={`Fechas de mint: ${validationResult.validMintDates ? 'Todas válidas' : 'Algunas inválidas'}`}
                    />
                </div>
            </div>

            {/* 🎓 Botón de Mint TP (solo se muestra si todo es válido) */}
            {validationResult.isValid && (
                <div className="mint-info-container">
                    <p
                        id="mint-description"
                        className="mint-info-text"
                        onClick={() => setShowMintBtn(true)}
                        tabIndex={0}
                        role="button"
                        aria-pressed={showMintBtn}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") setShowMintBtn(true);
                        }}
                    >
                        ✅ Todos los requisitos están cumplidos. Haz clic aquí para mintear tu NFT de trabajo práctico.
                    </p>

                    {showMintBtn && (
                        <button
                            className="mint-tp-btn"
                            onClick={onMintTP}
                            type="button"
                            aria-describedby="mint-description"
                        >
                            🎓 MINT NFT TP
                        </button>
                    )}
                </div>
            )}

        </div>
    );
};

// 🎯 Configuraciones de toast centralizadas
const TOAST_CONFIGS = {
    success: {
        position: "top-right" as const,
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
    },
    error: {
        position: "top-right" as const,
        autoClose: 8000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
    },
    mint: {
        position: "top-center" as const,
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
    }
} as const;

export default function NFTViewer() {
    // 🔗 Estado para la dirección de la wallet conectada
    const [walletAddress, setWalletAddress] = useState("");

    // 🎣 Hook personalizado que maneja toda la lógica de NFTs
    const {
        nfts,              // 📦 Array de NFTs cargados
        loading,           // ⏳ Estado de carga (true/false)
        error,             // ❌ Mensaje de error si algo falla
        validationResult,  // ✅ Resultado de la validación de NFTs
        loadAndValidateNFTs, // 🔄 Función para cargar y validar NFTs
        reset              // 🧹 Función para limpiar el estado
    } = useNFTLoader();

    // 🎓 Función para manejar el mint del TP (memoizada para optimización)
    const handleMintTP = useCallback(() => {
        // 🚧 TODO: Implementar lógica real de mint
        toast.success("🚀 Iniciando proceso de mint del TP...", TOAST_CONFIGS.mint);
    }, []);

    // 🔌 Función principal para conectar la wallet (memoizada)
    const conectarWallet = useCallback(async () => {
        // 🔍 Verificar si MetaMask está instalada
        if (!window.ethereum) {
            toast.error("MetaMask no está instalada", TOAST_CONFIGS.error);
            return;
        }

        try {
            // 🔓 Solicitar acceso a las cuentas de MetaMask
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts"
            });

            const address = accounts[0];
            setWalletAddress(address);

            // 🧹 Limpiar cualquier estado anterior
            reset();

            // 🚀 Cargar NFTs y realizar validación en modo permisivo
            const { validation } = await loadAndValidateNFTs(address, 'permissive');

            // ✅ Mostrar resultado según la validación
            if (validation.isValid) {
                toast.success(
                    "🎉 ¡Validación exitosa! Todos los requisitos se cumplen. Puedes proceder con el mint del TP.",
                    TOAST_CONFIGS.success
                );
            } else {
                // 📝 Crear lista de errores específicos
                const errorMessages = [
                    !validation.hasExactly10NFTs && `❌ Necesitas exactamente 10 NFTs UNQ (tienes ${nfts.length})`,
                    !validation.allNFTsValid && `❌ Algunos NFTs han sido retransferidos`,
                    !validation.validMintDates && `❌ Algunos NFTs no cumplen la fecha límite (28/05/2024)`,
                    ...validation.errors
                ].filter(Boolean); // 🔧 Filtrar valores falsy

                toast.error(
                    `⚠️ Validación fallida:\n${errorMessages.join('\n')}`,
                    TOAST_CONFIGS.error
                );
            }

        } catch (err) {
            console.error("Error al conectar wallet:", err);
            const errorMsg = "Error al conectar la wallet o cargar NFTs.";
            toast.error(errorMsg, TOAST_CONFIGS.error);
        }
    }, [loadAndValidateNFTs, nfts.length, reset]);

    return (
        <div className="viewer-container">
            <div className="content-wrapper">
                <main className="text-center mb-4" role="main">
                    {/* 🎯 Título y botón principal */}
                    <header className="mb-3">
                        <h1 className="main-title">🎓 Visualizador de NFTs UNQ</h1>
                    </header>

                    <button
                        className="view-btn p-2"
                        onClick={conectarWallet}
                        disabled={loading}
                        type="button"
                        aria-describedby={loading ? "loading-status" : undefined}
                    >
                        {loading ? "CONECTANDO..." : "CONECTAR WALLET"}
                    </button>

                    {/* 🔗 Sección que se muestra solo cuando hay wallet conectada */}
                    {walletAddress && (
                        <section className="mt-3" aria-labelledby="wallet-section">
                            <h2 id="wallet-section" className="sr-only">
                                Estado de la wallet y validación
                            </h2>

                            <p className="wallet" role="status">
                                <span className="wallet-label">Conectado:</span>
                                <span className="wallet-address">{walletAddress}</span>
                            </p>

                            {/* ✅ Panel de estado de validación */}
                            <ValidationPanel
                                validationResult={validationResult}
                                nftsCount={nfts.length}
                                onMintTP={handleMintTP}
                            />
                        </section>
                    )}

                    {/* 🔄 Estados de carga y error */}
                    {loading && (
                        <p
                            id="loading-status"
                            className="loading-text"
                            role="status"
                            aria-live="polite"
                        >
                            🔄 Cargando y validando NFTs...
                        </p>
                    )}

                    {error && (
                        <p
                            className="error"
                            role="alert"
                            aria-live="assertive"
                        >
                            {error}
                        </p>
                    )}

                    {/* 📦 Lista de NFTs (solo cuando no está cargando y hay NFTs) */}
                    {!loading && nfts.length > 0 && (
                        <section aria-labelledby="nft-list-title">
                            <h2 id="nft-list-title" className="sr-only">
                                Lista de NFTs encontrados
                            </h2>
                            <NFTList nfts={nfts} />
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}