// components/PromotionSection.tsx
import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { usePromotion } from '../hooks/usePromotion'; // ✅ Usar usePromotion
import { ProfessorService } from '../services/professorService';

interface PromotionSectionProps {
  professorWallet: string;
  canPromote: boolean;
  studentWallet: string;
  studentName: string;
}

export const PromotionSection: React.FC<PromotionSectionProps> = ({
  professorWallet,
  canPromote,
  studentWallet,
  studentName
}) => {
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [promotionText, setPromotionText] = useState('');
  const [editableStudentName, setEditableStudentName] = useState('');

  // ✅ Usar usePromotion correctamente
  const {
    promoteStudent,
    isPromoting,
    promotionResult,
    error: promotionError,
    resetPromotionState
  } = usePromotion();

  const handleShowPromotionForm = useCallback(() => {
    setShowPromotionForm(true);
    setPromotionText('');
    setEditableStudentName(studentName); // Inicializar con el nombre del certificado
    resetPromotionState(); // Reset del estado de promoción
  }, [resetPromotionState, studentName]);

  const handleHidePromotionForm = useCallback(() => {
    setShowPromotionForm(false);
    setPromotionText('');
    setEditableStudentName('');
    resetPromotionState();
  }, [resetPromotionState]);

  const handlePromoteStudent = useCallback(async () => {
    if (!editableStudentName.trim()) {
      toast.error("El nombre del estudiante es requerido");
      return;
    }

    if (!promotionText.trim()) {
      toast.error("El texto de promoción es requerido");
      return;
    }

    if (promotionText.length > 500) {
      toast.error("El texto es muy largo (máximo 500 caracteres)");
      return;
    }

    // ✅ Usar usePromotion con los 4 parámetros requeridos
    const result = await promoteStudent(
      professorWallet,
      studentWallet,
      editableStudentName.trim(),
      promotionText.trim()
    );

    // Si fue exitoso, mantener el formulario abierto para mostrar el resultado
    if (result.success) {
      // No cerrar el formulario inmediatamente para mostrar el éxito
      console.log('🎉 Promoción exitosa:', result);
    }
  }, [professorWallet, studentWallet, editableStudentName, promotionText, promoteStudent]);

  // Si hay resultado exitoso, mostrar detalles
  if (promotionResult?.success) {
    return (
      <div className="promotion-success-container">
        <div className="promotion-success-header">
          <span className="success-icon">🎓</span>
          <h3 className="success-title">¡Estudiante Promocionado Exitosamente!</h3>
        </div>

        <div className="promotion-success-details">
          <div className="promotion-detail">
            <strong>Estudiante:</strong> {editableStudentName}
          </div>
          
          <div className="promotion-detail">
            <strong>Profesor:</strong> {ProfessorService.getProfessorName(professorWallet)}
          </div>
          
          <div className="promotion-detail">
            <strong>Wallet del Estudiante:</strong> {studentWallet.slice(0, 8)}...{studentWallet.slice(-6)}
          </div>
          
          {promotionResult.tokenId && (
            <div className="promotion-detail">
              <strong>Token ID de Promoción:</strong> #{promotionResult.tokenId}
            </div>
          )}
          
          {promotionResult.transactionHash && (
            <div className="promotion-detail">
              <strong>Hash de Transacción:</strong> 
              <span className="hash-short">
                {promotionResult.transactionHash.slice(0, 10)}...{promotionResult.transactionHash.slice(-8)}
              </span>
            </div>
          )}
          
          {promotionResult.etherscanUrl && (
            <a
              href={promotionResult.etherscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="etherscan-link"
            >
              🔗 Ver en Etherscan
            </a>
          )}

          <div className="promotion-detail">
            <strong>Texto de Promoción:</strong> 
            <div className="promotion-text-display">"{promotionText}"</div>
          </div>
        </div>

        <button
          onClick={handleHidePromotionForm}
          className="back-button"
          type="button"
        >
          ← Crear Nueva Promoción
        </button>
      </div>
    );
  }

  // Si no puede promocionar, mostrar mensaje informativo
  if (!canPromote) {
    return (
      <div className="promotion-disabled-container">
        <div className="promotion-disabled-header">
          <span className="disabled-icon">🚫</span>
          <h4 className="disabled-title">Promoción No Disponible</h4>
        </div>
        <p className="disabled-message">
          Este profesor no tiene NFTs TP necesarios para promocionar estudiantes.
        </p>
      </div>
    );
  }

  // Formulario de promoción
  if (showPromotionForm) {
    return (
      <div className="promotion-form-container">
        <div className="promotion-form-header">
          <span className="form-icon">🎓</span>
          <h3 className="form-title">Promocionar Estudiante</h3>
        </div>

        <div className="promotion-form-content">
          <div className="student-info">
            <p><strong>Wallet del Estudiante:</strong> {studentWallet.slice(0, 8)}...{studentWallet.slice(-6)}</p>
            <p><strong>Profesor:</strong> {ProfessorService.getProfessorName(professorWallet)}</p>
          </div>

          {/* Campo para nombre del estudiante */}
          <div className="student-name-input">
            <label htmlFor="studentName" className="input-label">
              Nombre del Estudiante *
            </label>
            <input
              id="studentName"
              type="text"
              value={editableStudentName}
              onChange={(e) => setEditableStudentName(e.target.value)}
              placeholder="Ingresa el nombre completo del estudiante"
              maxLength={100}
              className="student-name-field"
              disabled={isPromoting}
            />
            <div className="input-hint">
              Puedes modificar el nombre si es necesario
            </div>
          </div>

          {/* Campo para texto de promoción */}
          <div className="promotion-text-input">
            <label htmlFor="promotionText" className="input-label">
              Texto de Promoción *
            </label>
            <textarea
              id="promotionText"
              value={promotionText}
              onChange={(e) => setPromotionText(e.target.value)}
              placeholder="Escribe un mensaje de promoción personalizado para el estudiante. Ejemplo: 'Por su excelente desempeño en el curso de React y su dedicación excepcional...'"
              maxLength={500}
              rows={4}
              className="promotion-textarea"
              disabled={isPromoting}
            />
            <div className="character-counter">
              {promotionText.length}/500 caracteres
            </div>
          </div>

          <div className="promotion-form-actions">
            <button
              onClick={handlePromoteStudent}
              disabled={isPromoting || !promotionText.trim() || !editableStudentName.trim()}
              className="promote-button"
              type="button"
            >
              {isPromoting ? (
                <>
                  <span className="loading-spinner">⏳</span>
                  CREANDO NFT DE PROMOCIÓN...
                </>
              ) : (
                <>🎓 CREAR NFT DE PROMOCIÓN</>
              )}
            </button>

            <button
              onClick={handleHidePromotionForm}
              disabled={isPromoting}
              className="cancel-button"
              type="button"
            >
              ❌ Cancelar
            </button>
          </div>

          {/* Mostrar error si existe */}
          {(promotionResult?.error || promotionError) && (
            <div className="promotion-error">
              <span className="error-icon">❌</span>
              <span className="error-text">
                {promotionResult?.error || promotionError}
              </span>
            </div>
          )}

          {/* Información adicional */}
          <div className="promotion-info">
            <h4>ℹ️ Información sobre el NFT de Promoción:</h4>
            <ul>
              <li>Se creará un NFT único para el estudiante</li>
              <li>El NFT contendrá el nombre y texto personalizado</li>
              <li>Solo profesores con NFTs TP pueden crear promociones</li>
              <li>La transacción será registrada en la blockchain</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Botón inicial para mostrar formulario
  return (
    <div className="promotion-available-container">
      <div className="promotion-available-header">
        <span className="available-icon">🎓</span>
        <h4 className="available-title">Promoción Disponible</h4>
      </div>
      
      <p className="available-message">
        Como profesor con NFTs TP, puedes crear un NFT de promoción personalizado para este estudiante.
      </p>

      <button
        onClick={handleShowPromotionForm}
        className="show-promotion-button"
        type="button"
      >
        🎯 CREAR NFT DE PROMOCIÓN
      </button>
    </div>
  );
};