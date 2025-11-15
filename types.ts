
export interface Warning {
  id: string; // This will be the 6-digit report ID
  doctorMedicalId: string;
  doctorFirstName: string;
  doctorLastName: string;
  doctorSpecialty: string;
  doctorCity: string;
  reason: string;
  date: string;
}

export interface Patient {
  nationalId: string;
  name: string;
  warnings: Warning[];
}

export interface GroundingSource {
    web?: {
        uri: string;
        title: string;
    }
}
