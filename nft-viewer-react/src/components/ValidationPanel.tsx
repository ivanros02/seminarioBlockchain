import { useMemo } from 'react';
import { ValidationBadge } from './ValidationBadge';
import { MintSection } from './MintSection';
import type { ValidationResult } from '../types/validation';
import type { MintResult } from '../services/mintTPService';

interface ValidationPanelProps {
  validationResult: ValidationResult | null;
  nftsCount: number;
  onMintTP: () => void;
  isMinting?: boolean;
  mintResults?: {
    pablo: MintResult | null;
    daniel: MintResult | null;
  };
  mintError?: string | null;
}

export const ValidationPanel = ({ 
  validationResult, 
  nftsCount, 
  onMintTP,
  isMinting,
  mintResults,
  mintError
}: ValidationPanelProps) => {
  if (!validationResult) return null;

  const validationBadges = useMemo(() => [
    {
      isValid: validationResult.hasExactly10NFTs,
      text: `${nftsCount}/10 NFTs`,
      ariaLabel: `Cantidad de NFTs: ${nftsCount} de 10 requeridos${validationResult.hasExactly10NFTs ? ', válido' : ', inválido'}`
    },
    {
      isValid: validationResult.allNFTsValid,
      text: "No retransferidos",
      ariaLabel: `Estado de transferencia: ${validationResult.allNFTsValid ? 'Todos son originales' : 'Algunos fueron transferidos'}`
    },
    {
      isValid: validationResult.validMintDates,
      text: "Fecha Mint",
      ariaLabel: `Fechas de mint: ${validationResult.validMintDates ? 'Todas válidas' : 'Algunas inválidas'}`
    }
  ], [validationResult, nftsCount]);

  return (
    <div
      className={`validation-status ${validationResult.isValid ? 'valid' : 'invalid'}`}
      role="region"
      aria-labelledby="validation-header"
    >
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

      <div className="validation-badges">
        <div className="badges-container" role="list" aria-label="Requisitos de validación">
          {validationBadges.map((badge, index) => (
            <ValidationBadge
              key={index}
              isValid={badge.isValid}
              text={badge.text}
              ariaLabel={badge.ariaLabel}
            />
          ))}
        </div>
      </div>

      {validationResult.isValid && (
        <MintSection 
          onMintTP={onMintTP}
          isMinting={isMinting}
          mintResults={mintResults}
          mintError={mintError}
        />
      )}
    </div>
  );
};