import React, { useState } from 'react';
import { usePatientContext } from '../context/PatientContext';
import { analyzeWarningReason } from '../services/geminiService';
import { Warning } from '../types';

interface ReasonDetails {
    incident: string;
    motive: string;
    expression: string;
    target: string;
}

const ReportWarning: React.FC = () => {
    // Doctor Info
    const [doctorMedicalId, setDoctorMedicalId] = useState('');
    const [doctorFirstName, setDoctorFirstName] = useState('');
    const [doctorLastName, setDoctorLastName] = useState('');
    const [doctorSpecialty, setDoctorSpecialty] = useState('');
    const [doctorCity, setDoctorCity] = useState('');

    // Patient Info
    const [patientName, setPatientName] = useState('');
    const [patientNationalId, setPatientNationalId] = useState('');
    const [reasonDetails, setReasonDetails] = useState<ReasonDetails>({
        incident: '',
        motive: '',
        expression: '',
        target: '',
    });

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'error' | 'info'; message: string } | null>(null);
    const [modalState, setModalState] = useState<{ type: 'success' | 'error'; analysis: string; reportId?: string; } | null>(null);
    const [copied, setCopied] = useState(false);
    const [showAddDetails, setShowAddDetails] = useState(false);
    const [additionalDetails, setAdditionalDetails] = useState('');


    const { addWarning } = usePatientContext();

    const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setReasonDetails(prev => ({ ...prev, [name]: value }));
    };

    const formatReason = (details: ReasonDetails): string => {
        return `شرح دقیق اتفاق: ${details.incident}\n\nزمینه و انگیزه احتمالی: ${details.motive}\n\nنحوه ابراز خشونت: ${details.expression}\n\nخشونت متوجه چه کسی بود: ${details.target}`;
    };

    // Mock validation
    const validateMedicalId = (id: string): boolean => {
        return /^\d{5,10}$/.test(id);
    };
    
    const generateReportId = (): string => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    const clearForm = () => {
        setDoctorMedicalId('');
        setDoctorFirstName('');
        setDoctorLastName('');
        setDoctorSpecialty('');
        setDoctorCity('');
        setPatientName('');
        setPatientNationalId('');
        setReasonDetails({
            incident: '',
            motive: '',
            expression: '',
            target: '',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);
        
        const isReasonComplete = Object.values(reasonDetails).every(field => field.trim() !== '');

        if (!doctorMedicalId || !doctorFirstName || !doctorLastName || !doctorSpecialty || !doctorCity || !patientName || !patientNationalId || !isReasonComplete) {
            setStatus({ type: 'error', message: 'لطفاً تمام فیلدها را پر کنید.' });
            return;
        }

        if (!validateMedicalId(doctorMedicalId)) {
            setStatus({ type: 'error', message: 'شماره نظام پزشکی معتبر نیست.' });
            return;
        }

        setIsLoading(true);
        setStatus({ type: 'info', message: 'در حال تحلیل هوشمند دلیل اخطار... این فرآیند ممکن است کمی طول بکشد.' });
        
        const formattedReason = formatReason(reasonDetails);
        const analysisResult = await analyzeWarningReason(formattedReason);

        if (analysisResult.isValid) {
            const newId = generateReportId();
            const newWarning: Warning = {
                id: newId,
                doctorMedicalId,
                doctorFirstName,
                doctorLastName,
                doctorSpecialty,
                doctorCity,
                reason: formattedReason,
                date: new Date().toLocaleDateString('fa-IR'),
            };
            addWarning(patientName, patientNationalId, newWarning);
            setModalState({
                type: 'success',
                reportId: newId,
                analysis: analysisResult.analysis,
            });

        } else {
             setModalState({
                type: 'error',
                analysis: analysisResult.analysis || "دلیل ارائه شده منطقی یا کافی به نظر نمی‌رسد.",
            });
        }
        setIsLoading(false);
        setStatus(null);
    };
    
    const handleCloseModal = () => {
        if (modalState?.type === 'success') {
            clearForm();
        }
        setModalState(null);
        setCopied(false);
        setShowAddDetails(false);
        setAdditionalDetails('');
    };

    const handleCopyId = () => {
        if (modalState?.type === 'success' && modalState.reportId) {
            navigator.clipboard.writeText(modalState.reportId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        }
    };
    
    const handleResubmitWithDetails = async () => {
        if (!additionalDetails.trim()) return;

        setIsLoading(true);
        
        const originalFormattedReason = formatReason(reasonDetails);
        const combinedReason = `${originalFormattedReason}\n\n[توضیحات تکمیلی]:\n${additionalDetails}`;
        const result = await analyzeWarningReason(combinedReason);

        if (result.isValid) {
            const newId = generateReportId();
            const newWarning: Warning = {
                id: newId,
                doctorMedicalId,
                doctorFirstName,
                doctorLastName,
                doctorSpecialty,
                doctorCity,
                reason: combinedReason, // Save combined reason
                date: new Date().toLocaleDateString('fa-IR'),
            };
            addWarning(patientName, patientNationalId, newWarning);
            setModalState({
                type: 'success',
                reportId: newId,
                analysis: result.analysis,
            });
        } else {
            setModalState({
                type: 'error',
                analysis: result.analysis || "دلیل ارائه شده هنوز کافی نیست. لطفاً جزئیات بیشتری ارائه دهید.",
            });
        }
        
        setShowAddDetails(false);
        setAdditionalDetails('');
        setIsLoading(false);
    };


    const statusColor = {
        error: 'bg-red-950/50 border-red-600 text-red-400',
        info: 'bg-neutral-800/50 border-neutral-600 text-neutral-300'
    };

    return (
        <>
            <div className="bg-neutral-950 p-6 md:p-8 rounded-xl shadow-2xl border border-neutral-800">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-200">ثبت اخطار برای بیمار</h2>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <fieldset className="border border-neutral-700 rounded-lg p-4">
                        <legend className="px-2 text-red-400 font-semibold">اطلاعات پزشک</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="doctorFirstName" className="block text-sm font-medium text-gray-400 mb-2">نام</label>
                                <input type="text" id="doctorFirstName" value={doctorFirstName} onChange={e => setDoctorFirstName(e.target.value)} placeholder="مثال: علی" className="w-full bg-black/50 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-600" />
                            </div>
                            <div>
                                <label htmlFor="doctorLastName" className="block text-sm font-medium text-gray-400 mb-2">نام خانوادگی</label>
                                <input type="text" id="doctorLastName" value={doctorLastName} onChange={e => setDoctorLastName(e.target.value)} placeholder="مثال: محمدی" className="w-full bg-black/50 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-600" />
                            </div>
                             <div>
                                <label htmlFor="doctorMedicalId" className="block text-sm font-medium text-gray-400 mb-2">شماره نظام پزشکی</label>
                                <input type="text" id="doctorMedicalId" value={doctorMedicalId} onChange={e => setDoctorMedicalId(e.target.value)} placeholder="مثال: 12345" className="w-full bg-black/50 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-600" />
                            </div>
                            <div>
                                <label htmlFor="doctorSpecialty" className="block text-sm font-medium text-gray-400 mb-2">رشته</label>
                                <input type="text" id="doctorSpecialty" value={doctorSpecialty} onChange={e => setDoctorSpecialty(e.target.value)} placeholder="مثال: متخصص داخلی" className="w-full bg-black/50 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-600" />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="doctorCity" className="block text-sm font-medium text-gray-400 mb-2">شهر</label>
                                <input type="text" id="doctorCity" value={doctorCity} onChange={e => setDoctorCity(e.target.value)} placeholder="مثال: تهران" className="w-full bg-black/50 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-600" />
                            </div>
                        </div>
                    </fieldset>
                    
                    <fieldset className="border border-neutral-700 rounded-lg p-4">
                        <legend className="px-2 text-red-400 font-semibold">اطلاعات بیمار</legend>
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="patientName" className="block text-sm font-medium text-gray-400 mb-2">نام کامل بیمار</label>
                                <input type="text" id="patientName" value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="مثال: رضا احمدی" className="w-full bg-black/50 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-600" />
                            </div>
                            <div>
                                <label htmlFor="patientNationalId" className="block text-sm font-medium text-gray-400 mb-2">کد ملی بیمار</label>
                                <input type="text" id="patientNationalId" value={patientNationalId} onChange={e => setPatientNationalId(e.target.value)} placeholder="مثال: 0012345678" className="w-full bg-black/50 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-600" />
                            </div>
                        </div>
                    </fieldset>
                    
                    <fieldset className="border border-neutral-700 rounded-lg p-4">
                         <legend className="px-2 text-red-400 font-semibold">جزئیات اخطار</legend>
                         <div className="space-y-4">
                            <div>
                                <label htmlFor="incident" className="block text-sm font-medium text-gray-400 mb-2">ماجرا چه بوده؟ (شرح دقیق اتفاق)</label>
                                <textarea name="incident" id="incident" value={reasonDetails.incident} onChange={handleReasonChange} rows={3} placeholder="مثال: بیمار پس از شنیدن خبر عدم نیاز به بستری، با صدای بلند شروع به فریاد زدن کرد." className="w-full bg-black/50 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-600"></textarea>
                            </div>
                             <div>
                                <label htmlFor="motive" className="block text-sm font-medium text-gray-400 mb-2">چرا بیمار این کار را کرد؟ (زمینه و انگیزه احتمالی)</label>
                                <input type="text" name="motive" id="motive" value={reasonDetails.motive} onChange={handleReasonChange} placeholder="مثال: به نظر می‌رسید از تشخیص پزشک ناراضی بود و انتظار داشت بستری شود." className="w-full bg-black/50 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-600" />
                            </div>
                             <div>
                                <label htmlFor="expression" className="block text-sm font-medium text-gray-400 mb-2">خشونت چگونه ابراز شد؟ (کلامی، فیزیکی، تهدید مستقیم)</label>
                                <input type="text" name="expression" id="expression" value={reasonDetails.expression} onChange={handleReasonChange} placeholder="مثال: با مشت به میز منشی کوبید و پرسنل را تهدید کرد." className="w-full bg-black/50 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-600" />
                            </div>
                             <div>
                                <label htmlFor="target" className="block text-sm font-medium text-gray-400 mb-2">خشونت متوجه چه کسی بود؟</label>
                                <input type="text" name="target" id="target" value={reasonDetails.target} onChange={handleReasonChange} placeholder="مثال: منشی و پرستار بخش" className="w-full bg-black/50 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-600" />
                            </div>
                         </div>
                    </fieldset>

                    <div>
                        <button type="submit" disabled={isLoading} className="w-full bg-red-700 hover:bg-red-800 disabled:bg-red-900/50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3">
                            {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
                            <span>{isLoading ? 'در حال پردازش...' : 'ثبت و ارسال اخطار'}</span>
                        </button>
                    </div>
                </form>
                {status && (
                    <div className={`mt-6 p-4 border rounded-lg text-sm whitespace-pre-wrap ${statusColor[status.type]}`}>
                        {status.message}
                    </div>
                )}
            </div>

            {modalState && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                   {modalState.type === 'success' ? (
                        <div className="bg-neutral-900 border border-green-700 rounded-xl shadow-2xl max-w-md w-full p-8">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-green-400 mb-4">اخطار با موفقیت ثبت شد</h3>
                                <p className="text-gray-300 mb-2">اطلاعات شما محرمانه باقی خواهد ماند.</p>
                                <p className="text-gray-300 mb-6">لطفاً این شناسه گزارش را برای مراجعات بعدی نزد خود نگه دارید:</p>
                            </div>
                            <div className="flex items-center justify-between gap-4 bg-black/50 border border-neutral-700 rounded-lg p-4">
                                <span className="text-3xl font-mono tracking-widest text-white select-all">
                                    {modalState.reportId}
                                </span>
                                <button 
                                    onClick={handleCopyId} 
                                    className={`bg-neutral-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm w-24 ${copied ? 'bg-green-600' : 'hover:bg-neutral-600'}`}
                                >
                                    {copied ? 'کپی شد!' : 'کپی'}
                                </button>
                            </div>
                            {modalState.analysis && (
                                <div className="mt-6 text-right">
                                    <p className="text-gray-400 text-sm mb-2 font-semibold">خلاصه تحلیل هوش مصنوعی:</p>
                                    <div className="bg-black/50 border border-neutral-700 rounded-lg p-3 text-sm text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto text-justify leading-relaxed">
                                        {modalState.analysis}
                                    </div>
                                </div>
                            )}
                            <button onClick={handleCloseModal} className="mt-8 w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 px-4 rounded-lg transition-colors">
                                متوجه شدم
                            </button>
                        </div>
                   ) : (
                        <div className="bg-neutral-900 border border-red-700 rounded-xl shadow-2xl max-w-md w-full p-8">
                                <div className="text-center">
                                <h3 className="text-2xl font-bold text-red-400 mb-4">اخطار ثبت نشد</h3>
                                <p className="text-gray-300 mb-6">هوش مصنوعی دلیل ارائه شده را برای ثبت اخطار کافی ندانست.</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400 text-sm mb-2 font-semibold">تحلیل هوش مصنوعی:</p>
                                <div className="bg-black/50 border border-neutral-700 rounded-lg p-3 text-sm text-gray-300 whitespace-pre-wrap max-h-60 overflow-y-auto text-justify leading-relaxed">
                                    {modalState.analysis}
                                </div>
                            </div>
                            
                            {showAddDetails && (
                                <div className="mt-4">
                                    <label htmlFor="additionalDetails" className="block text-sm font-medium text-gray-400 mb-2">جزئیات تکمیلی را اینجا وارد کنید:</label>
                                    <textarea 
                                        id="additionalDetails" 
                                        value={additionalDetails} 
                                        onChange={e => setAdditionalDetails(e.target.value)} 
                                        rows={4} 
                                        className="w-full bg-black/50 border border-neutral-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-600"></textarea>
                                    <button onClick={handleResubmitWithDetails} disabled={isLoading || !additionalDetails.trim()} className="mt-2 w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800/50 text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                                        {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
                                        <span>{isLoading ? 'در حال تحلیل مجدد...' : 'ارسال مجدد با توضیحات تکمیلی'}</span>
                                    </button>
                                </div>
                            )}

                            {!showAddDetails && (
                                <button onClick={() => setShowAddDetails(true)} className="mt-4 w-full bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors">
                                    افزودن جزئیات و تلاش مجدد
                                </button>
                            )}
                            
                            <button onClick={handleCloseModal} className="mt-4 w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2.5 px-4 rounded-lg transition-colors">
                                بازگشت و اصلاح فرم
                            </button>
                        </div>
                   )}
                </div>
            )}
        </>
    );
};

export default ReportWarning;