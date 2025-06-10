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
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          {/* Header de éxito */}
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center bg-success-subtle rounded-circle mb-3" style={{width: '60px', height: '60px'}}>
              <i className="bi bi-mortarboard fs-2 text-success"></i>
            </div>
            <h4 className="fw-bold text-success mb-0">¡Promoción Exitosa!</h4>
            <p className="text-muted">El NFT de promoción ha sido creado correctamente</p>
          </div>

          {/* Detalles de la promoción */}
          <div className="row g-3 mb-4">
            <div className="col-12">
              <div className="bg-light rounded p-3">
                <div className="row g-2">
                  <div className="col-sm-6">
                    <small className="text-muted d-block">Estudiante</small>
                    <span className="fw-semibold">{editableStudentName}</span>
                  </div>
                  <div className="col-sm-6">
                    <small className="text-muted d-block">Profesor</small>
                    <span className="fw-semibold">{ProfessorService.getProfessorName(professorWallet)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="border rounded p-3">
                <small className="text-muted d-block mb-1">Wallet del Estudiante</small>
                <code className="small">{studentWallet.slice(0, 8)}...{studentWallet.slice(-6)}</code>
              </div>
            </div>

            {promotionResult.tokenId && (
              <div className="col-sm-6">
                <div className="border rounded p-3">
                  <small className="text-muted d-block mb-1">Token ID</small>
                  <span className="badge bg-primary">#{promotionResult.tokenId}</span>
                </div>
              </div>
            )}

            {promotionResult.transactionHash && (
              <div className="col-sm-6">
                <div className="border rounded p-3">
                  <small className="text-muted d-block mb-1">Transaction Hash</small>
                  <code className="small text-truncate d-block">
                    {promotionResult.transactionHash.slice(0, 10)}...{promotionResult.transactionHash.slice(-8)}
                  </code>
                </div>
              </div>
            )}

            <div className="col-12">
              <div className="bg-info-subtle border border-info rounded p-3">
                <small className="text-muted d-block mb-2">Texto de Promoción</small>
                <p className="mb-0 fst-italic">"{promotionText}"</p>
              </div>
            </div>
          </div>

          {/* Enlaces y acciones */}
          <div className="d-flex flex-column flex-sm-row gap-2 align-items-center">
            {promotionResult.etherscanUrl && (
              <a
                href={promotionResult.etherscanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-sm me-auto"
              >
                <i className="bi bi-box-arrow-up-right me-1"></i>
                Ver en Etherscan
              </a>
            )}
            
            <button
              onClick={handleHidePromotionForm}
              className="btn btn-secondary"
              type="button"
            >
              <i className="bi bi-arrow-left me-1"></i>
              Nueva Promoción
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si no puede promocionar, mostrar mensaje informativo
  if (!canPromote) {
    return (
      <div className="card border-warning">
        <div className="card-body p-4 text-center">
          <div className="d-inline-flex align-items-center justify-content-center bg-warning-subtle rounded-circle mb-3" style={{width: '50px', height: '50px'}}>
            <i className="bi bi-exclamation-triangle fs-4 text-warning"></i>
          </div>
          <h5 className="card-title text-warning">Promoción No Disponible</h5>
          <p className="card-text text-muted mb-0">
            Este profesor no tiene NFTs TP necesarios para promocionar estudiantes.
          </p>
        </div>
      </div>
    );
  }

  // Formulario de promoción
  if (showPromotionForm) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-primary text-white border-0">
          <div className="d-flex align-items-center">
            <i className="bi bi-mortarboard me-2"></i>
            <h5 className="mb-0">Crear NFT de Promoción</h5>
          </div>
        </div>

        <div className="card-body p-4">
          {/* Información del estudiante */}
          <div className="bg-light rounded p-3 mb-4">
            <div className="row g-2 small">
              <div className="col-12">
                <span className="text-muted">Wallet del Estudiante:</span>
                <code className="ms-2">{studentWallet.slice(0, 8)}...{studentWallet.slice(-6)}</code>
              </div>
              <div className="col-12">
                <span className="text-muted">Profesor:</span>
                <span className="ms-2 fw-semibold">{ProfessorService.getProfessorName(professorWallet)}</span>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Campo nombre del estudiante */}
            <div className="mb-3">
              <label htmlFor="studentName" className="form-label fw-semibold">
                Nombre del Estudiante <span className="text-danger">*</span>
              </label>
              <input
                id="studentName"
                type="text"
                className="form-control"
                value={editableStudentName}
                onChange={(e) => setEditableStudentName(e.target.value)}
                placeholder="Ingresa el nombre completo del estudiante"
                maxLength={100}
                disabled={isPromoting}
              />
              <div className="form-text">
                Puedes modificar el nombre si es necesario
              </div>
            </div>

            {/* Campo texto de promoción */}
            <div className="mb-4">
              <label htmlFor="promotionText" className="form-label fw-semibold">
                Texto de Promoción <span className="text-danger">*</span>
              </label>
              <textarea
                id="promotionText"
                className="form-control"
                value={promotionText}
                onChange={(e) => setPromotionText(e.target.value)}
                placeholder="Escribe un mensaje de promoción personalizado para el estudiante. Ejemplo: 'Por su excelente desempeño en el curso de React y su dedicación excepcional...'"
                maxLength={500}
                rows={4}
                disabled={isPromoting}
              />
              <div className="d-flex justify-content-between align-items-center mt-1">
                <div className="form-text">
                  Describe los logros y méritos del estudiante
                </div>
                <small className={`text-end ${promotionText.length > 450 ? 'text-warning' : 'text-muted'}`}>
                  {promotionText.length}/500
                </small>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="d-grid gap-2 d-sm-flex justify-content-sm-end">
              <button
                onClick={handleHidePromotionForm}
                disabled={isPromoting}
                className="btn btn-outline-secondary"
                type="button"
              >
                <i className="bi bi-x-lg me-1"></i>
                Cancelar
              </button>
              
              <button
                onClick={handlePromoteStudent}
                disabled={isPromoting || !promotionText.trim() || !editableStudentName.trim()}
                className="btn btn-primary"
                type="button"
              >
                {isPromoting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creando NFT...
                  </>
                ) : (
                  <>
                    <i className="bi bi-award me-1"></i>
                    Crear NFT de Promoción
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Mostrar error si existe */}
          {(promotionResult?.error || promotionError) && (
            <div className="alert alert-danger d-flex align-items-center mt-3" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <div>
                {promotionResult?.error || promotionError}
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="mt-4 p-3 bg-info-subtle rounded">
            <h6 className="text-info mb-2">
              <i className="bi bi-info-circle me-1"></i>
              Información sobre el NFT de Promoción
            </h6>
            <ul className="small mb-0 ps-3">
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
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4 text-center">
        <div className="d-inline-flex align-items-center justify-content-center bg-success-subtle rounded-circle mb-3" style={{width: '60px', height: '60px'}}>
          <i className="bi bi-mortarboard fs-2 text-success"></i>
        </div>
        
        <h5 className="card-title text-success mb-2">Promoción Disponible</h5>
        <p className="card-text text-muted mb-4">
          Como profesor con NFTs TP, puedes crear un NFT de promoción personalizado para este estudiante.
        </p>

        <button
          onClick={handleShowPromotionForm}
          className="btn btn-success btn-lg"
          type="button"
        >
          <i className="bi bi-award me-2"></i>
          Crear NFT de Promoción
        </button>
      </div>
    </div>
  );
};