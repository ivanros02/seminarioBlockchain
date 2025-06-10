// components/PromotionsSection.tsx
import React, { useState, useEffect } from 'react';
import { PromotionNFTCard } from './PromotionNFTCard';
import { PromotionNFTLoader, type PromotionNFT } from '../services/promotionNFTLoader';
import '../styles/PromotionsSection.css'; // Asegúrate de tener estilos adecuados

interface PromotionsSectionProps {
  walletAddress: string;
}

export const PromotionsSection: React.FC<PromotionsSectionProps> = ({ walletAddress }) => {
  const [promotions, setPromotions] = useState<PromotionNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [expanded, setExpanded] = useState(false);

  // 🔄 Cargar promociones cuando cambia la wallet
  useEffect(() => {
    if (walletAddress) {
      loadPromotions();
    } else {
      setPromotions([]);
      setError('');
    }
  }, [walletAddress]);

  const loadPromotions = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🎓 Cargando promociones para:', walletAddress);
      const promotionNFTs = await PromotionNFTLoader.loadPromotionNFTs(walletAddress);
      setPromotions(promotionNFTs);
      
      if (promotionNFTs.length > 0) {
        console.log(`✅ ${promotionNFTs.length} promociones encontradas`);
      } else {
        console.log('📭 No hay promociones para esta wallet');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando promociones';
      setError(errorMessage);
      console.error('❌ Error cargando promociones:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadPromotions();
  };

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  // 🎨 Calcular estadísticas
  const stats = {
    total: promotions.length,
    professors: [...new Set(promotions.map(p => p.professorName))],
    latest: promotions.sort((a, b) => b.tokenId - a.tokenId)[0]
  };

  return (
    <div className="promotions-section">
      {/* Header de la sección */}
      <div className="promotions-header">
        <div className="section-title-container">
          <h2 className="section-title">
            🎓 Mis Promociones
            {promotions.length > 0 && (
              <span className="promotion-count-badge">{promotions.length}</span>
            )}
          </h2>
          <p className="section-subtitle">
            Certificados de promoción otorgados por profesores
          </p>
        </div>

        <div className="section-actions">
          <button
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={loading}
            title="Actualizar promociones"
          >
            {loading ? '⏳' : '🔄'}
          </button>
          
          {promotions.length > 0 && (
            <button
              className="toggle-expand-btn"
              onClick={handleToggleExpand}
              title={expanded ? 'Contraer' : 'Expandir'}
            >
              {expanded ? '🔽' : '🔼'}
            </button>
          )}
        </div>
      </div>

      {/* Estados de carga y error */}
      {loading && (
        <div className="promotions-loading">
          <span className="loading-spinner">⏳</span>
          <p>Cargando promociones...</p>
        </div>
      )}

      {error && (
        <div className="promotions-error">
          <span className="error-icon">❌</span>
          <p>Error: {error}</p>
          <button onClick={handleRefresh} className="retry-btn">
            🔄 Reintentar
          </button>
        </div>
      )}

      {/* Contenido principal */}
      {!loading && !error && (
        <>
          {promotions.length === 0 ? (
            // Estado vacío
            <div className="promotions-empty">
              <div className="empty-icon">🎓</div>
              <h3>No tienes promociones aún</h3>
              <p>Cuando un profesor te promocione, aparecerá aquí tu certificado.</p>
              <div className="empty-info">
                <small>Contrato: ???</small>
              </div>
            </div>
          ) : (
            // Lista de promociones
            <div className="promotions-content">
              {/* Estadísticas rápidas */}
              <div className="promotions-stats">
                <div className="stat-item">
                  <span className="stat-number">{stats.total}</span>
                  <span className="stat-label">Total</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{stats.professors.length}</span>
                  <span className="stat-label">Profesores</span>
                </div>
                {stats.latest && (
                  <div className="stat-item">
                    <span className="stat-number">#{stats.latest.tokenId}</span>
                    <span className="stat-label">Último</span>
                  </div>
                )}
              </div>

              {/* Lista de profesores */}
              {expanded && stats.professors.length > 0 && (
                <div className="professors-list">
                  <h4>👨‍🏫 Profesores que te han promocionado:</h4>
                  <div className="professors-tags">
                    {stats.professors.map((professor, index) => (
                      <span key={index} className="professor-tag">
                        {professor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Grid de promociones */}
              <div className="promotions-grid">
                {promotions.map((promotion) => (
                  <PromotionNFTCard 
                    key={promotion.tokenId} 
                    nft={promotion} 
                  />
                ))}
              </div>

              {/* Info del contrato */}
              {expanded && (
                <div className="contract-info">
                  <h4>📋 Información del Contrato</h4>
                  <div className="contract-details">
                    <div className="contract-row">
                      <span className="contract-label">Dirección:</span>
                      <span className="contract-value">0x0e6586512ba0e1395C4576267CC8c62f5a4EA18C</span>
                    </div>
                    <div className="contract-row">
                      <span className="contract-label">Red:</span>
                      <span className="contract-value">Sepolia Testnet</span>
                    </div>
                    <div className="contract-row">
                      <span className="contract-label">Estándar:</span>
                      <span className="contract-value">ERC-1155</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};