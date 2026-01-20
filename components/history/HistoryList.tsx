
import React, { useState, useEffect } from 'react';
import HistoryItem, { HistoryItemData } from './HistoryItem';
import { historyService, HistoryRound } from '../../services/historyService';

interface HistoryListProps {
    onSelectReport: (report: HistoryItemData) => void;
    patientId: string;
}

const HistoryList: React.FC<HistoryListProps> = ({ onSelectReport, patientId }) => {
    const [rounds, setRounds] = useState<HistoryRound[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            console.log('📚 Carregando histórico do paciente:', patientId);
            setLoading(true);
            try {
                const historyData = await historyService.getPatientRoundsHistory(patientId);
                console.log('📚 Histórico carregado:', historyData);
                setRounds(historyData);
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

    // Converter HistoryRound em HistoryItemData para compatibilidade com HistoryItem
    const convertToHistoryItem = (round: HistoryRound, shift: 'morning' | 'afternoon' | 'night'): HistoryItemData => {
        const shiftLabel = {
            morning: 'Manhã',
            afternoon: 'Tarde',
            night: 'Noite'
        }[shift];

        const shiftEmoji = {
            morning: '🌅',
            afternoon: '☀️',
            night: '🌙'
        }[shift];

        // Gerar descrição resumida
        const assessmentText = round.assessment[shift];
        const recommendationText = round.recommendation[shift];
        const description = assessmentText || recommendationText 
            ? (assessmentText.substring(0, 100) || recommendationText.substring(0, 100)) + '...'
            : 'Sem dados preenchidos neste turno';

        // Formatar data
        const date = new Date(round.created_at);
        const dateStr = date.toLocaleDateString('pt-BR');
        const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        return {
            datetime: `${dateStr} - ${timeStr} ${shiftEmoji} ${shiftLabel}`,
            status: round.status === 'instavel' ? 'Urgente' : 
                    round.status === 'em_risco' ? 'Atenção' : 
                    round.status === 'estavel' ? 'Normal' : 'Informativo',
            description,
            author: round.saved_by_names[shift] || 'Não preenchido',
            sbar: {
                situation: '',
                background: '',
                assessment: {
                    morning: shift === 'morning' ? round.assessment.morning : '',
                    afternoon: shift === 'afternoon' ? round.assessment.afternoon : '',
                    night: shift === 'night' ? round.assessment.night : ''
                },
                recommendation: {
                    morning: shift === 'morning' ? round.recommendation.morning : '',
                    afternoon: shift === 'afternoon' ? round.recommendation.afternoon : '',
                    night: shift === 'night' ? round.recommendation.night : ''
                }
            }
        };
    };

    // Gerar lista de itens de histórico (um item por turno preenchido)
    const historyItems: HistoryItemData[] = [];
    
    rounds.forEach(round => {
        // Verificar quais turnos têm dados
        if (round.assessment.morning || round.recommendation.morning) {
            historyItems.push(convertToHistoryItem(round, 'morning'));
        }
        if (round.assessment.afternoon || round.recommendation.afternoon) {
            historyItems.push(convertToHistoryItem(round, 'afternoon'));
        }
        if (round.assessment.night || round.recommendation.night) {
            historyItems.push(convertToHistoryItem(round, 'night'));
        }
    });

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
