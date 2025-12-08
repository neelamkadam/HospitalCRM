export interface CreateReportTypes {
  patientId: {
    value: string;
    label: string;
  } | null;
  reportText?: string;
  audioFile?: File | null | string;
  images?: File[];
}

export type ParsedItem = {
  header: string;
  subheaders?: string[];
};
