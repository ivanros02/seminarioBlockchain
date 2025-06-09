// hooks/useProfessor.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { ProfessorService, type ProfessorData } from '../services/professorService';
import type { CertificateInfo } from '../constants/tpConstants'; // ✅ Import directo desde constants

interface UseProfessorReturn {
  professorData: ProfessorData | null;
  loading: boolean;
  error: string | null;
  promoting: boolean;
  loadProfessorData: (walletAddress: string) => Promise<void>;
  promoteStudent: (certificate: CertificateInfo) => Promise<void>;
  reset: () => void;
}

export const useProfessor = (): UseProfessorReturn => {
  const [professorData, setProfessorData] = useState<ProfessorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoting, setPromoting] = useState(false);

  const loadProfessorData = useCallback(async (walletAddress: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ProfessorService.getProfessorData(walletAddress);
      setProfessorData(data);
      
      if (data.isProfessor) {
        console.log(`👨‍🏫 Profesor ${data.professorName} conectado`);
        if (data.hasTPNFT) {
          toast.success(`¡Bienvenido Profesor ${data.professorName}! Tienes ${data.nfts.length} certificado(s) TP.`);
        } else {
          toast.info(`Bienvenido Profesor ${data.professorName}. No tienes certificados TP aún.`);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error cargando datos del profesor';
      setError(message);
      toast.error(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const promoteStudent = useCallback(async (certificate: CertificateInfo) => {
    if (!professorData?.canPromote) {
      toast.error('No tienes permisos para promocionar');
      return;
    }

    setPromoting(true);
    
    try {
      const success = await ProfessorService.promoteStudent(
        professorData.walletAddress, 
        certificate
      );
      
      if (success) {
        toast.success(`🎉 ¡Estudiante ${certificate.studentName} promocionado exitosamente!`);
      } else {
        toast.error('Error en la promoción');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error promocionando estudiante';
      toast.error(`Error: ${message}`);
    } finally {
      setPromoting(false);
    }
  }, [professorData]);

  const reset = useCallback(() => {
    setProfessorData(null);
    setError(null);
    setLoading(false);
    setPromoting(false);
  }, []);

  return {
    professorData,
    loading,
    error,
    promoting,
    loadProfessorData,
    promoteStudent,
    reset
  };
};