
import React from 'react';
import HistoryItem, { HistoryItemData } from './HistoryItem';

const mockHistoryItems: HistoryItemData[] = [
    {
        datetime: '25/07/2024 - 08:15',
        status: 'Urgente',
        description: 'Piora no padrão respiratório e queda de saturação para 88% em ar ambiente.',
        author: 'Dr. Carlos Andrade',
        sbar: {
            situation: 'Paciente com piora súbita no padrão respiratório, apresentando dispneia intensa e uso de musculatura acessória.',
            background: 'Paciente asmático, internado por pneumonia comunitária há 3 dias. Sem histórico de intubação prévia.',
            assessment: {
                morning: 'Saturação caiu para 88% em ar ambiente, frequência respiratória de 28 irpm. Ausculta pulmonar com sibilos difusos.',
                afternoon: '',
                night: ''
            },
            recommendation: {
                morning: 'Administrar oxigênio suplementar para manter SatO2 > 92%, iniciar broncodilatador de curta ação e contatar fisioterapia respiratória. Avaliar necessidade de VNI.',
                afternoon: '',
                night: ''
            }
        }
    },
    {
        datetime: '24/07/2024 - 19:30',
        status: 'Atenção',
        description: 'Paciente apresentou febre de 38.5°C, medicado conforme prescrição.',
        author: 'Enf. Juliana Oliveira',
        sbar: {
            situation: 'Pico febril de 38.5°C aferido às 19:15. Paciente refere calafrios e cefaleia.',
            background: 'Em antibioticoterapia para pneumonia. Última dose administrada há 6 horas.',
            assessment: {
                morning: '',
                afternoon: 'Paciente consciente, orientado, hidratado. Hemodinamicamente estável, apesar da febre.',
                night: ''
            },
            recommendation: {
                morning: '',
                afternoon: 'Administrado antitérmico prescrito. Coletar nova cultura de sangue se a febre persistir. Manter observação rigorosa dos sinais vitais.',
                night: ''
            }
        }
    },
    {
        datetime: '24/07/2024 - 14:00',
        status: 'Normal',
        description: 'Paciente estável após medicação, parâmetros dentro da normalidade.',
        author: 'Enf. Juliana Oliveira',
        sbar: {
            situation: 'Paciente calmo, colaborativo, sem queixas álgicas no momento.',
            background: 'Evoluindo bem ao tratamento para pneumonia.',
            assessment: {
                morning: '',
                afternoon: 'Sinais vitais estáveis, saturação de 96% em ar ambiente. Diurese presente e de bom volume.',
                night: ''
            },
            recommendation: {
                morning: '',
                afternoon: 'Manter cuidados de rotina e observar aceitação da dieta.',
                night: ''
            }
        }
    },
    {
        datetime: '23/07/2024 - 10:05',
        status: 'Informativo',
        description: 'Admissão na unidade vindo do centro cirúrgico. Estável.',
        author: 'Enf. Ricardo Souza',
        sbar: {
            situation: 'Paciente admitido na unidade de internação, vindo do centro cirúrgico após apendicectomia.',
            background: 'Sem comorbidades prévias. Procedimento cirúrgico ocorreu sem intercorrências.',
            assessment: {
                morning: 'Consciente, orientado, estável hemodinamicamente. Saturação 98% com cateter nasal 2L/min. Refere dor leve em sítio cirúrgico (EVA 3/10).',
                afternoon: '',
                night: ''
            },
            recommendation: {
                morning: 'Administrar analgesia prescrita se necessário. Manter monitoramento de sinais vitais e do curativo cirúrgico.',
                afternoon: '',
                night: ''
            }
        }
    }
];

interface HistoryListProps {
    onSelectReport: (report: HistoryItemData) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ onSelectReport }) => {
    return (
        <div className="flex flex-col gap-3">
            {mockHistoryItems.map((item, index) => (
                <HistoryItem key={index} item={item} onSelectReport={onSelectReport} />
            ))}
        </div>
    );
};

export default HistoryList;
