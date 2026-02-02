
import React, { useState, useEffect, useMemo } from 'react';
import HistoryItem, { HistoryItemData } from './HistoryItem';
import { historyService, HistoryRound } from '../../services/historyService';

interface HistoryListProps {
    onSelectReport: (report: HistoryItemData) => void;
    patientId: string;
    selectedShifts?: {
        morning: boolean;
        afternoon: boolean;
        night: boolean;
    };
    selectedDate?: string;
}

const HistoryList: React.FC<HistoryListProps> = ({ onSelectReport, patientId, selectedShifts = { morning: true, afternoon: true, night: true }, selectedDate = '' }) => {
    const [rounds, setRounds] = useState<HistoryRound[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastFetch, setLastFetch] = useState<number>(0);
    
    // Cache de 1 minuto
    const CACHE_TIME = 60000;

    useEffect(() => {
        const loadHistory = async () => {
            const now = Date.now();
            
            // Se tem cache válido, não recarregar
            if (rounds.length > 0 && (now - lastFetch) < CACHE_TIME) {
                setLoading(false);
                return;
            }

            console.log('📚 Carregando histórico do paciente:', patientId);
            setLoading(true);
            try {
                const historyData = await historyService.getPatientRoundsHistory(patientId);
                console.log('📚 Histórico carregado:', historyData);
                setRounds(historyData);
                setLastFetch(now);
            } catch (error) {
                console.error('❌ Erro ao carregar histórico:', error);
                setRounds([]);
            } finally {
                setLoading(false);
            }
        };

        if (patientId) {
            loadHistory();
        }
    }, [patientId]);

    // Converter HistoryRound em HistoryItemData agrupado por data
    const convertToHistoryItem = (round: HistoryRound): HistoryItemData => {
        // Formatar data
        const date = new Date(round.created_at);
        const dateStr = date.toLocaleDateString('pt-BR');
        const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        // Criar descrição com os turnos preenchidos
        const shiftLabels: string[] = [];
        const shiftDescriptions: string[] = [];

        if (round.assessment.morning || round.recommendation.morning) {
            shiftLabels.push('🌅 Manhã');
            shiftDescriptions.push(round.assessment.morning || round.recommendation.morning);
        }
        if (round.assessment.afternoon || round.recommendation.afternoon) {
            shiftLabels.push('☀️ Tarde');
            shiftDescriptions.push(round.assessment.afternoon || round.recommendation.afternoon);
        }
        if (round.assessment.night || round.recommendation.night) {
            shiftLabels.push('🌙 Noite');
            shiftDescriptions.push(round.assessment.night || round.recommendation.night);
        }

        // Descrição resumida (primeiros 100 caracteres)
        const description = shiftDescriptions.length > 0
            ? shiftDescriptions[0].substring(0, 100) + '...'
            : 'Sem dados preenchidos neste dia';

        // Autor (primeiro que preencheu)
        const author = round.saved_by_names.morning || 
                      round.saved_by_names.afternoon || 
                      round.saved_by_names.night || 
                      'Não preenchido';

        return {
            datetime: `${dateStr} - ${timeStr}`,
            status: round.status === 'instavel' ? 'Urgente' : 
                    round.status === 'em_risco' ? 'Atenção' : 
                    round.status === 'estavel' ? 'Normal' : 'Informativo',
            description: shiftLabels.join(' | ') + '\n' + description,
            author,
            sbar: {
                situation: '',
                background: '',
                assessment: round.assessment,
                recommendation: round.recommendation
            }
        };
    };

    // Gerar lista de itens de histórico (um item por data) - MEMOIZADO
    const historyItems: HistoryItemData[] = useMemo(() => {
        const items: HistoryItemData[] = [];
        
        rounds.forEach(round => {
            // Verificar se algum turno selecionado tem dados
            const hasMorning = selectedShifts.morning && (round.assessment.morning || round.recommendation.morning);
            const hasAfternoon = selectedShifts.afternoon && (round.assessment.afternoon || round.recommendation.afternoon);
            const hasNight = selectedShifts.night && (round.assessment.night || round.recommendation.night);

            // Se tem pelo menos um turno selecionado com dados, incluir
            if (hasMorning || hasAfternoon || hasNight) {
                // Filtrar por data se selecionada
                if (selectedDate) {
                    const roundDate = new Date(round.created_at);
                    const roundDateStr = roundDate.toISOString().split('T')[0]; // YYYY-MM-DD
                    if (roundDateStr !== selectedDate) {
                        return; // Skip this round
                    }
                }
                
                items.push(convertToHistoryItem(round));
            }
        });
        
        return items;
    }, [rounds, selectedShifts, selectedDate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-gray-400">Carregando histórico...</div>
            </div>
        );
    }

    if (historyItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-gray-400 text-lg mb-2">📚 Nenhum histórico encontrado</div>
                <div className="text-gray-500 text-sm">
                    Os dados preenchidos aparecerão aqui
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {historyItems.map((item, index) => (
                <HistoryItem key={index} item={item} onSelectReport={onSelectReport} />
            ))}
        </div>
    );
};

export default HistoryList;
