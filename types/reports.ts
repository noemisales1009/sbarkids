import { Patient } from './index';

export interface GlobalReportItem {
  id: string;
  patient: Patient;
  datetime: string;
  status: string;
  author: string;
  assessment: {
    morning: string;
    afternoon: string;
    night: string;
  };
  assessmentBy: {
    morning: string;
    afternoon: string;
    night: string;
  };
  recommendation: {
    morning: string;
    afternoon: string;
    night: string;
  };
  recommendationBy: {
    morning: string;
    afternoon: string;
    night: string;
  };
}
