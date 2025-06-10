import { useMemo, useState, useEffect } from 'react';
import { useWalletConnection } from '../hooks/useWalletConnection';
import { ValidationPanel } from './ValidationPanel';
import { WalletStatus } from './WalletStatus';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { NFTSection } from './NFTSection';
import { CertificateViewer } from './CertificateViewer';
import { ProfessorView } from './ProfessorView';
import { PromotionsSection } from './PromotionsSection'; // ✅ NUEVO import
import { ProfessorService } from '../services/professorService';
import '../styles/home.css';

export default function NFTViewer() {
  // ✅ Estados para mostrar/ocultar diferentes vistas
  const [showViewer, setShowViewer] = useState(false);
  const [showPromotions, setShowPromotions] = useState(false); // ✅ NUEVO estado
  const [isProfessor, setIsProfessor] = useState(false);
  
  const {
    walletAddress,
    nfts,
    loading,
    error,
    validationResult,
    conectarWallet,
    handleMintTP,
    isMinting,
    mintResults,
    mintError
  } = useWalletConnection();

  // 🎨 Estados computados
  const computedStates = useMemo(() => ({
    isWalletConnected: Boolean(walletAddress),
    hasNFTs: nfts.length > 0,
    shouldShowNFTList: !loading && nfts.length > 0
  }), [walletAddress, nfts.length, loading]);

  // ✅ Detectar si es profesor cuando se conecta wallet
  useEffect(() => {
    if (walletAddress) {
      const isProf = ProfessorService.isProfessorWallet(walletAddress);
      setIsProfessor(isProf);
      
      // Si es profesor, no mostrar visualizadores por defecto
      if (isProf) {
        setShowViewer(false);
        setShowPromotions(false);
      }
    } else {
      setIsProfessor(false);
      setShowViewer(false);
      setShowPromotions(false);
    }
  }, [walletAddress]);

  // ✅ Función para cambiar entre vistas
  const handleViewChange = (view: 'validation' | 'certificates' | 'promotions') => {
    setShowViewer(view === 'certificates');
    setShowPromotions(view === 'promotions');
  };

  return (
    <div className="viewer-container">
      <div className="content-wrapper">
        <main className="text-center mb-4" role="main">
          {/* Header */}
          <header className="mb-3">
            <h1 className="main-title">🎓 Visualizador de NFTs UNQ</h1>
            
            {/* ✅ Navegación entre vistas */}
            {computedStates.isWalletConnected && !isProfessor && (
              <div className="view-navigation">
                <button
                  className={`nav-btn ${!showViewer && !showPromotions ? 'active' : ''}`}
                  onClick={() => handleViewChange('validation')}
                  type="button"
                >
                  🎯 Validación
                </button>
                
                <button
                  className={`nav-btn ${showViewer ? 'active' : ''}`}
                  onClick={() => handleViewChange('certificates')}
                  type="button"
                >
                  🔍 Certificados TP
                </button>
                
                <button
                  className={`nav-btn ${showPromotions ? 'active' : ''}`}
                  onClick={() => handleViewChange('promotions')}
                  type="button"
                >
                   Mis Promociones
                </button>
              </div>
            )}
          </header>

          {/* ✅ Condicional: Vista según el tipo de usuario y selección */}
          {isProfessor ? (
            // Vista de profesor
            <ProfessorView walletAddress={walletAddress} />
          ) : showPromotions ? (
            // ✅ NUEVA: Vista de promociones
            <PromotionsSection walletAddress={walletAddress} />
          ) : showViewer ? (
            // Vista de certificados TP
            <CertificateViewer />
          ) : (
            // Vista principal de validación
            <>
              {/* 🔘 Botón principal */}
              <button
                className="view-btn p-2"
                onClick={conectarWallet}
                disabled={loading || isMinting}
                type="button"
                aria-describedby={loading ? "loading-status" : undefined}
              >
                {loading ? "CONECTANDO..." : "CONECTAR WALLET"}
              </button>

              {/* 🔗 Sección de wallet conectada */}
              {computedStates.isWalletConnected && (
                <section className="mt-3" aria-labelledby="wallet-section">
                  <h2 id="wallet-section" className="sr-only">
                    Estado de la wallet y validación
                  </h2>

                  <WalletStatus walletAddress={walletAddress} />
                  
                  <ValidationPanel
                    validationResult={validationResult}
                    nftsCount={nfts.length}
                    onMintTP={handleMintTP}
                    isMinting={isMinting}
                    mintResults={mintResults}
                    mintError={mintError}
                  />
                </section>
              )}

              {/* 🔄 Estados de carga y error */}
              {loading && <LoadingState />}
              {error && <ErrorState error={error} />}

              {/* 📦 Lista de NFTs UNQ (solo en vista de validación) */}
              {computedStates.shouldShowNFTList && <NFTSection nfts={nfts} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}