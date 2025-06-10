// components/PromotionSection.tsx
import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { usePromotion } from '../hooks/usePromotion'; // ✅ Usar el hook
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
  const [editableStudentName, setEditableStudentName] = useState(''); // ✅ NUEVO: nombre editable

  // ✅ Usar el hook de promoción
  const {
    promoteStudent,
    isPromoting,
    promotionResult,
    error: promotionError,
    resetPromotionState
  } = usePromotion();

  const handleShowPromotionForm = useCallback(() => {
    setShowPromotionForm(true);
    setPromotionText(''); // Reset del texto
    setEditableStudentName(studentName); // ✅ NUEVO: Inicializar con el nombre del certificado
    resetPromotionState(); // ✅ Reset usando el hook
  }, [resetPromotionState, studentName]);

  const handleHidePromotionForm = useCallback(() => {
    setShowPromotionForm(false);
    setPromotionText('');
    setEditableStudentName(''); // ✅ NUEVO: Reset del nombre
    resetPromotionState(); // ✅ Reset usando el hook
  }, [resetPromotionState]);

  const handlePromoteStudent = useCallback(async () => {
    if (!editableStudentName.trim()) { // ✅ NUEVO: Validar nombre editable
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

    // ✅ Usar el hook para promocionar con el nombre editable
    const result = await promoteStudent(
      professorWallet,
      studentWallet,
      editableStudentName.trim(), // ✅ NUEVO: Usar nombre editable
      promotionText.trim()
    );

    if (result.success) {
      setShowPromotionForm(false);
    }
  }, [professorWallet, studentWallet, editableStudentName, promotionText, promoteStudent]); // ✅ NUEVO: Agregar editableStudentName

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
            <strong>Estudiante:</strong> {editableStudentName || studentName} {/* ✅ CORREGIDO: Usar el estado local */}
          </div>
          
          <div className="promotion-detail">
            <strong>Profesor:</strong> {ProfessorService.getProfessorName(professorWallet)}
          </div>
          
          {promotionResult.tokenId && (
            <div className="promotion-detail">
              <strong>Token ID de Promoción:</strong> {promotionResult.tokenId}
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
        </div>

        <button
          onClick={handleHidePromotionForm}
          className="back-button"
          type="button"
        >
          ← Volver
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

          {/* ✅ NUEVO: Campo para nombre del estudiante */}
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
          </div>

          <div className="promotion-text-input">
            <label htmlFor="promotionText" className="input-label">
              Texto de Promoción *
            </label>
            <textarea
              id="promotionText"
              value={promotionText}
              onChange={(e) => setPromotionText(e.target.value)}
              placeholder="Escribe un mensaje de promoción para el estudiante (máx. 500 caracteres)"
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
                  PROMOCIONANDO...
                </>
              ) : (
                <>🎓 PROMOCIONAR ESTUDIANTE</>
              )}
            </button>

            <button
              onClick={handleHidePromotionForm}
              disabled={isPromoting}
              className="cancel-button"
              type="button"
            >
              Cancelar
            </button>
          </div>

          {/* Error si existe */}
          {promotionResult?.error && (
            <div className="promotion-error">
              <span className="error-icon">❌</span>
              <span className="error-text">{promotionResult.error}</span>
            </div>
          )}
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
        Como profesor con NFTs TP, puedes promocionar a este estudiante.
      </p>

      <button
        onClick={handleShowPromotionForm}
        className="show-promotion-button"
        type="button"
      >
        🎯 PROMOCIONAR ESTUDIANTE
      </button>
    </div>
  );
};