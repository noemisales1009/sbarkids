import React from 'react';
import { RoundAuditEntry as AuditLogEntry } from '../../services/roundAuditService';
import { ClinicalRoundAssessment } from '../../services/assessmentService';
import { ClinicalRoundRecommendation } from '../../services/recommendationService';

interface ShiftHistoryPanelProps {
  shift: 'morning' | 'afternoon' | 'night';
  auditLogs: AuditLogEntry[];
  assessmentData?: ClinicalRoundAssessment | null;
  recommendationData?: ClinicalRoundRecommendation | null;
}

const ShiftHistoryPanel: React.FC<ShiftHistoryPanelProps> = ({
  shift,
  auditLogs,
  assessmentData,
  recommendationData
}) => {
  const shiftLogs = auditLogs.filter(log => log.shift === shift);
  
  const getShiftLabel = () => {
    switch(shift) {
      case 'morning': return '🌅 Manhã';
      case 'afternoon': return '☀️ Tarde';
      case 'night': return '🌙 Noite';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Buscar dados salvos do Assessment
  const getAssessmentSavedInfo = () => {
    if (!assessmentData) return null;
    
    const shiftKey = shift;
    const savedAt = assessmentData[`${shiftKey}_saved_at`];
    const savedByName = assessmentData[`${shiftKey}_saved_by_name`];
    
    if (!savedAt) return null;
    
    return { savedAt, savedByName };
  };

  // Buscar dados salvos do Recommendation
  const getRecommendationSavedInfo = () => {
    if (!recommendationData) return null;
    
    const shiftKey = shift;
    const savedAt = recommendationData[`${shiftKey}_saved_at`];
    const savedByName = recommendationData[`${shiftKey}_saved_by_name`];
    
    if (!savedAt) return null;
    
    return { savedAt, savedByName };
  };

  const assessmentInfo = getAssessmentSavedInfo();
  const recommendationInfo = getRecommendationSavedInfo();

  if (!assessmentInfo && !recommendationInfo && shiftLogs.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
      <div className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
        📋 Histórico - {getShiftLabel()}
      </div>
      
      <div className="space-y-2 text-xs">
        {/* Assessment */}
        {assessmentInfo && (
          <div className="flex items-start gap-2 text-blue-800 dark:text-blue-300">
            <span>✅ Avaliação salva por:</span>
            <div>
              <div className="font-semibold">{assessmentInfo.savedByName || 'Médico'}</div>
              <div className="text-blue-600 dark:text-blue-400">{formatDate(assessmentInfo.savedAt)}</div>
            </div>
          </div>
        )}
        
        {/* Recommendation */}
        {recommendationInfo && (
          <div className="flex items-start gap-2 text-green-800 dark:text-green-300">
            <span>✅ Recomendação salva por:</span>
            <div>
              <div className="font-semibold">{recommendationInfo.savedByName || 'Médico'}</div>
              <div className="text-green-600 dark:text-green-400">{formatDate(recommendationInfo.savedAt)}</div>
            </div>
          </div>
        )}

        {/* Audit logs detalhados */}
        {shiftLogs.length > 0 && (
          <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
            {shiftLogs.map((log) => (
              <div key={log.id} className="text-blue-700 dark:text-blue-300 mb-1">
                <span className="font-semibold">{log.data_type === 'assessment' ? '📊' : '📝'}</span>
                {' '}{log.saved_by_name}
                {' '}({formatDate(log.saved_at)})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftHistoryPanel;
