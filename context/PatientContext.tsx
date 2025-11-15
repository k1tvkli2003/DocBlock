
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Patient, Warning } from '../types';

interface PatientContextType {
  patients: Patient[];
  addWarning: (patientName: string, patientNationalId: string, warning: Warning) => void;
  removeWarning: (patientNationalId: string, warningId: string) => void;
  findPatient: (query: string) => Patient | undefined;
  findWarning: (patientNationalId: string, warningId: string) => Warning | undefined;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

const MOCK_PATIENTS: Patient[] = [
    {
        nationalId: '1111111111',
        name: 'بیمار تستی اول',
        warnings: [
            {
                id: '123456',
                doctorMedicalId: '54321',
                doctorFirstName: 'علی',
                doctorLastName: 'رضایی',
                doctorSpecialty: 'قلب',
                doctorCity: 'تهران',
                reason: 'شرح دقیق اتفاق: بیمار به دلیل عدم رضایت از زمان انتظار، با صدای بلند در سالن انتظار فریاد کشید.\n\nزمینه و انگیزه احتمالی: بیمار از طولانی شدن زمان انتظار ناراضی بود.\n\nنحوه ابراز خشونت: تهدید کلامی و فریاد زدن.\n\nخشونت متوجه چه کسی بود: منشی و سایر بیماران در سالن انتظار.',
                date: '1403/05/01',
            }
        ]
    },
    {
        nationalId: '2222222222',
        name: 'بیمار تستی دوم',
        warnings: [
            {
                id: '654321',
                doctorMedicalId: '98765',
                doctorFirstName: 'مریم',
                doctorLastName: 'حسینی',
                doctorSpecialty: 'اطفال',
                doctorCity: 'اصفهان',
                reason: 'شرح دقیق اتفاق: بیمار پس از دریافت صورتحساب، اقدام به پرتاب کردن پرونده روی میز پزشک کرد.\n\nزمینه و انگیزه احتمالی: اعتراض به هزینه درمان.\n\nنحوه ابراز خشونت: خشونت فیزیکی با پرتاب اشیا.\n\nخشونت متوجه چه کسی بود: پزشک معالج.',
                date: '1403/04/15',
            },
            {
                id: '789012',
                doctorMedicalId: '11223',
                doctorFirstName: 'احمد',
                doctorLastName: 'کریمی',
                doctorSpecialty: 'عمومی',
                doctorCity: 'شیراز',
                reason: 'شرح دقیق اتفاق: تلاش برای دریافت داروی مخدر با نسخه جعلی و تهدید کلامی پس از مخالفت پزشک.\n\nزمینه و انگیزه احتمالی: اعتیاد و تلاش برای سوءاستفاده از سیستم درمانی.\n\nنحوه ابراز خشونت: تهدید به آسیب رساندن به تجهیزات مطب.\n\nخشونت متوجه چه کسی بود: پزشک.',
                date: '1403/03/20',
            }
        ]
    }
];


export const PatientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);

  const addWarning = (patientName: string, patientNationalId: string, newWarning: Warning) => {
    setPatients(prevPatients => {
      const existingPatientIndex = prevPatients.findIndex(p => p.nationalId === patientNationalId);
      if (existingPatientIndex !== -1) {
        // Patient exists, add new warning
        const updatedPatients = [...prevPatients];
        updatedPatients[existingPatientIndex].warnings.push(newWarning);
        return updatedPatients;
      } else {
        // New patient
        const newPatient: Patient = {
          name: patientName,
          nationalId: patientNationalId,
          warnings: [newWarning]
        };
        return [...prevPatients, newPatient];
      }
    });
  };

  const removeWarning = (patientNationalId: string, warningId: string) => {
    setPatients(prevPatients => {
      const patientIndex = prevPatients.findIndex(p => p.nationalId === patientNationalId);
      if (patientIndex === -1) return prevPatients;

      const updatedPatients = [...prevPatients];
      const patient = updatedPatients[patientIndex];
      
      // Filter out the warning
      patient.warnings = patient.warnings.filter(w => w.id !== warningId);

      // If patient has no warnings left, remove the patient
      if (patient.warnings.length === 0) {
        updatedPatients.splice(patientIndex, 1);
      }
      
      return updatedPatients;
    });
  };
  
  const findPatient = (query: string): Patient | undefined => {
    const foundPatient = patients.find(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.nationalId === query);
    if (foundPatient) {
        return foundPatient;
    }

    // For testing: if query is a 10-digit number and not found, return a mock patient
    if (/^\d{10}$/.test(query)) {
        const mockPatient: Patient = {
            nationalId: query,
            name: 'بیمار فرضی (تست)',
            warnings: [
                {
                    id: '000000',
                    doctorMedicalId: '99999',
                    doctorFirstName: 'سیستم',
                    doctorLastName: 'تست',
                    doctorSpecialty: 'عمومی',
                    doctorCity: 'آزمایشی',
                    reason: 'این یک گزارش آزمایشی است که برای نمایش قابلیت‌های سیستم به صورت خودکار ایجاد شده است. هیچ حادثه واقعی رخ نداده است.',
                    date: new Date().toLocaleDateString('fa-IR'),
                }
            ]
        };
        return mockPatient;
    }

    return undefined;
};


  const findWarning = (patientNationalId: string, warningId: string): Warning | undefined => {
    const patient = patients.find(p => p.nationalId === patientNationalId);
    if (!patient) return undefined;
    return patient.warnings.find(w => w.id === warningId);
  };


  return (
    <PatientContext.Provider value={{ patients, addWarning, removeWarning, findPatient, findWarning }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatientContext = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatientContext must be used within a PatientProvider');
  }
  return context;
};