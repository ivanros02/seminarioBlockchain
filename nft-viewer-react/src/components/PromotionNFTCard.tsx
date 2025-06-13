// components/PromotionNFTCard.tsx
import React from 'react';
import type { PromotionNFT } from '../types/NFT';

interface PromotionNFTCardProps {
  nft: PromotionNFT;
}

export const PromotionNFTCard: React.FC<PromotionNFTCardProps> = ({ nft }) => {
  return (
    <div className="nft-card promotion-nft-card">
      {/* Header del NFT de promoción */}
      <div className="nft-card-header promotion-header">
        <div className="promotion-badge">
          <span className="promotion-icon">🎓</span>
          <span className="promotion-label">PROMOCIÓN</span>
        </div>
        <div className="token-id">#{nft.tokenId}</div>
      </div>

      {/* Contenido principal */}
      <div className="nft-card-content">
        {/* Avatar/Logo de promoción */}
        <div className="promotion-avatar">
          <div className="avatar-circle">
            <span className="avatar-icon">🎓</span>
          </div>
        </div>

        {/* Información del estudiante */}
        <div className="promotion-info">
          <h3 className="student-name">{nft.studentName}</h3>
          <p className="promotion-subtitle">Certificado de Promoción</p>
        </div>

        {/* Detalles de la promoción */}
        <div className="promotion-details">
          <div className="detail-row">
            <span className="detail-label">👨‍🏫 Profesor:</span>
            <span className="detail-value">{nft.professorName}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">📅 Fecha:</span>
            <span className="detail-value">{nft.promotionDate}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">🏆 Balance:</span>
            <span className="detail-value">{nft.balance}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">🏆 Nota:</span>
            <span className="detail-value">{nft.grade}</span>
          </div>
        </div>

        {/* Texto de promoción */}
        <div className="promotion-text-section">
          <h4 className="promotion-text-title">💬 Mensaje de Promoción:</h4>
          <div className="promotion-text-content">
            <p className="promotion-text">
              "{nft.promotionText}"
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="nft-card-footer promotion-footer">
        <div className="promotion-status">
          <span className="status-icon">✅</span>
          <span className="status-text">Promoción Completada</span>
        </div>
      </div>
    </div>
  );
};