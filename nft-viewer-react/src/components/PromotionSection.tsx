// components/PromotionSection.tsx
import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { usePromotion } from '../hooks/usePromotion';
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
  const [grade, setGrade] = useState('');
  const [editableStudentName, setEditableStudentName] = useState('');
  
  // ✅ NUEVO ESTADO: IDs de NFTs que el estudiante posee
  const [claimedTokenIds, setClaimedTokenIds] = useState<number[]>([8, 16, 25, 34, 42, 49, 56, 63, 70, 77]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const {
    promoteStudent,
    isPromoting,
    promotionResult,
    error: promotionError,
    resetPromotionState,
    validateStudentNFTs // ✅ NUEVA FUNCIÓN DEL HOOK
  } = usePromotion();

  const handleShowPromotionForm = useCallback(() => {
    setShowPromotionForm(true);
    setPromotionText('');
    setGrade('');
    setEditableStudentName(studentName);
    resetPromotionState();
  }, [resetPromotionState, studentName]);

  const handleHidePromotionForm = useCallback(() => {
    setShowPromotionForm(false);
    setPromotionText('');
    setGrade('');
    setEditableStudentName('');
    setShowAdvancedOptions(false);
    resetPromotionState();
  }, [resetPromotionState]);

  // ✅ FUNCIÓN PARA VALIDAR NFTs ANTES DE PROMOCIONAR
  const handleValidateNFTs = useCallback(async () => {
    try {
      const validation = await validateStudentNFTs(studentWallet, claimedTokenIds);
      
      if (validation.isValid) {
        toast.success(`✅ Todos los NFTs son válidos (${claimedTokenIds.length} verificados)`);
      } else {
        toast.error(`❌ NFTs inválidos: ${validation.invalidIds.join(', ')}`);
      }
      
      return validation.isValid;
    } catch (error) {
      toast.error('Error validando NFTs');
      return false;
    }
  }, [studentWallet, claimedTokenIds, validateStudentNFTs]);

  const handlePromoteStudent = useCallback(async () => {
    if (!editableStudentName.trim()) {
      toast.error("El nombre del estudiante es requerido");
      return;
    }

    if (!promotionText.trim()) {
      toast.error("El texto de promoción es requerido");
      return;
    }

    if (!grade.trim()) {
      toast.error("La nota es requerida");
      return;
    }

    if (promotionText.length > 500) {
      toast.error("El texto es muy largo (máximo 500 caracteres)");
      return;
    }

    if (grade.length > 50) {
      toast.error("La nota es muy larga (máximo 50 caracteres)");
      return;
    }

    // ✅ VALIDACIÓN DE NFTs
    if (claimedTokenIds.length === 0) {
      toast.error("Debe especificar al menos un NFT");
      return;
    }

    // ✅ Usar usePromotion con el nuevo parámetro claimedTokenIds
    const result = await promoteStudent(
      professorWallet,
      studentWallet,
      editableStudentName.trim(),
      promotionText.trim(),
      grade.trim(),
      claimedTokenIds // ✅ PASAR LOS NFTs RECLAMADOS
    );

    if (result.success) {
      console.log('🎉 Promoción exitosa:', result);
    }
  }, [professorWallet, studentWallet, editableStudentName, promotionText, grade, claimedTokenIds, promoteStudent]);

  // ✅ FUNCIÓN PARA MANEJAR CAMBIOS EN LOS IDs DE NFTs
  const handleTokenIdsChange = useCallback((value: string) => {
    try {
      // Permitir input como "8,16,25,34" o "8 16 25 34"
      const ids = value
        .split(/[,\s]+/)
        .filter(id => id.trim())
        .map(id => {
          const num = parseInt(id.trim());
          if (isNaN(num) || num < 0) {
            throw new Error(`ID inválido: ${id}`);
          }
          return num;
        });
      
      setClaimedTokenIds(ids);
    } catch (error) {
      toast.error('IDs de NFT inválidos. Use números separados por comas o espacios.');
    }
  }, []);

  // Si hay resultado exitoso, mostrar detalles
  if (promotionResult?.success) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center bg-success-subtle rounded-circle mb-3" style={{width: '60px', height: '60px'}}>
              <i className="bi bi-mortarboard fs-2 text-success"></i>
            </div>
            <h4 className="fw-bold text-success mb-0">¡Promoción Exitosa!</h4>
            <p className="text-muted">El NFT de promoción ha sido creado correctamente</p>
          </div>

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

            <div className="col-sm-6">
              <div className="bg-warning-subtle border border-warning rounded p-3">
                <small className="text-muted d-block mb-1">Nota Otorgada</small>
                <span className="badge bg-warning text-dark fs-6">{grade}</span>
              </div>
            </div>

            {/* ✅ MOSTRAR NFTs VALIDADOS */}
            <div className="col-sm-6">
              <div className="bg-info-subtle border border-info rounded p-3">
                <small className="text-muted d-block mb-1">NFTs Validados</small>
                <span className="badge bg-info">{claimedTokenIds.length} NFTs</span>
              </div>
            </div>

            {promotionResult.tokenId && (
              <div className="col-12">
                <div className="border rounded p-3">
                  <small className="text-muted d-block mb-1">Token ID</small>
                  <span className="badge bg-primary">#{promotionResult.tokenId}</span>
                </div>
              </div>
            )}

            {/* ✅ MOSTRAR IDs DE NFTs VALIDADOS */}
            <div className="col-12">
              <div className="bg-success-subtle border border-success rounded p-3">
                <small className="text-muted d-block mb-2">NFTs Validados en la Promoción</small>
                <div className="d-flex flex-wrap gap-1">
                  {claimedTokenIds.map(id => (
                    <span key={id} className="badge bg-success text-white">#{id}</span>
                  ))}
                </div>
              </div>
            </div>

            {promotionResult.transactionHash && (
              <div className="col-12">
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

          <form onSubmit={(e) => e.preventDefault()}>
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
            </div>

            <div className="mb-3">
              <label htmlFor="grade" className="form-label fw-semibold">
                Nota <span className="text-danger">*</span>
              </label>
              <input
                id="grade"
                type="text"
                className="form-control"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Ej: A+, 95, Excelente, 9.5"
                maxLength={50}
                disabled={isPromoting}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="promotionText" className="form-label fw-semibold">
                Texto de Promoción <span className="text-danger">*</span>
              </label>
              <textarea
                id="promotionText"
                className="form-control"
                value={promotionText}
                onChange={(e) => setPromotionText(e.target.value)}
                placeholder="Escribe un mensaje de promoción personalizado..."
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

            {/* ✅ SECCIÓN AVANZADA: NFTs del Estudiante */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label fw-semibold mb-0">
                  NFTs del Estudiante <span className="text-danger">*</span>
                </label>
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                >
                  {showAdvancedOptions ? 'Ocultar' : 'Personalizar'} NFTs
                </button>
              </div>

              {showAdvancedOptions ? (
                <div className="border rounded p-3 bg-light">
                  <div className="mb-3">
                    <label className="form-label small">IDs de NFTs (separados por comas)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={claimedTokenIds.join(', ')}
                      onChange={(e) => handleTokenIdsChange(e.target.value)}
                      placeholder="8, 16, 25, 34, 42, 49, 56, 63, 70, 77"
                      disabled={isPromoting}
                    />
                  </div>
                  
                  <div className="d-flex gap-2 align-items-center">
                    <button
                      type="button"
                      onClick={handleValidateNFTs}
                      className="btn btn-outline-info btn-sm"
                      disabled={isPromoting || claimedTokenIds.length === 0}
                    >
                      <i className="bi bi-check-circle me-1"></i>
                      Validar NFTs
                    </button>
                    
                    <small className="text-muted">
                      {claimedTokenIds.length} NFT{claimedTokenIds.length !== 1 ? 's' : ''} especificado{claimedTokenIds.length !== 1 ? 's' : ''}
                    </small>
                  </div>
                </div>
              ) : (
                <div className="border rounded p-3 bg-info-subtle">
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">NFTs por defecto:</small>
                    <small className="fw-semibold">{claimedTokenIds.length} NFTs</small>
                  </div>
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    {claimedTokenIds.slice(0, 10).map(id => (
                      <span key={id} className="badge bg-info text-white">#{id}</span>
                    ))}
                    {claimedTokenIds.length > 10 && (
                      <span className="badge bg-secondary">+{claimedTokenIds.length - 10} más</span>
                    )}
                  </div>
                </div>
              )}
            </div>

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
                disabled={isPromoting || !promotionText.trim() || !editableStudentName.trim() || !grade.trim() || claimedTokenIds.length === 0}
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

          {(promotionResult?.error || promotionError) && (
            <div className="alert alert-danger d-flex align-items-center mt-3" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <div>
                {promotionResult?.error || promotionError}
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-info-subtle rounded">
            <h6 className="text-info mb-2">
              <i className="bi bi-info-circle me-1"></i>
              Información sobre la Validación
            </h6>
            <ul className="small mb-0 ps-3">
              <li>El contrato validará automáticamente que el estudiante posee los NFTs especificados</li>
              <li>Solo se pueden promocionar estudiantes con NFTs válidos del contrato original</li>
              <li>Los NFTs validados quedarán registrados en la promoción</li>
              <li>Puedes personalizar los IDs o usar la configuración por defecto</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

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