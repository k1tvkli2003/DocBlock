import React, { useState } from 'react';
import { usePatientContext } from '../context/PatientContext';
import { analyzeWithdrawalReason } from '../services/geminiService';

const WithdrawWarning: React.FC = () => {
    const [doctorMedicalId, setDoctorMedicalId] = useState('');
    const [patientNationalId, setPatientNationalId] = useState('');
    const [reportId, setReportId] = useState('');
    const [withdrawalReason, setWithdrawalReason] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

    const { findWarning, removeWarning } = usePatientContext();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);

        if (!doctorMedicalId || !patientNationalId || !reportId || !withdrawalReason) {
            setStatus({ type: 'error', message: 'لطفاً تمام فیلدها را پر کنید.' });
            return;
        }

        const originalWarning = findWarning(patientNationalId, reportId);

        if (!originalWarning) {
            setStatus({ type: 'error', message: 'اخطاری با این مشخصات یافت نشد. لطفاً اطلاعات را بررسی کنید.' });
            return;
        }

        if (originalWarning.doctorMedicalId !== doctorMedicalId) {
            setStatus({ type: 'error', message: 'شماره نظام پزشکی با گزارش ثبت شده مطابقت ندارد.' });
            return;
        }

        setIsLoading(true);
        setStatus({ type: 'info', message: 'در حال تحلیل هوشمند درخواست شما... این فرآیند ممکن است کمی طول بکشد.' });
        
        const result = await analyzeWithdrawalReason(originalWarning.reason, withdrawalReason);

        if (result.isApproved) {
            removeWarning(patientNationalId, reportId);
            setStatus({ type: 'success', message: `تحلیل هوش مصنوعی: ${result.analysis}\nدرخواست شما تایید شد. اخطار با موفقیت حذف گردید.` });
            // Clear form
            setDoctorMedicalId('');
            setPatientNationalId('');
            setReportId('');
            setWithdrawalReason('');
        } else {
            setStatus({ type: 'error', message: `تحلیل هوش مصنوعی: ${result.analysis}\nدرخواست شما رد شد. اخطار حذف نشد.` });
        }

        setIsLoading(false);
    };

    const statusColor = {
        success: 'bg-green-950/50 border-green-700 text-green-400',
        error: 'bg-red-950/50 border-red-600 text-red-400',
        info: 'bg-neutral-800/50 border-neutral-600 text-neutral-300'
    };

    return (
        <div className="bg-neutral-950 p-6 md:p-8 rounded-xl shadow-2xl border border-neutral-800">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-200">پس گرفتن و حذف اخطار</h2>
            <p className="text-center text-gray-400 mb-6">در این بخش می‌توانید با ارائه اطلاعات صحیح، یک اخطار ثبت شده را پس بگیرید. درخواست شما توسط هوش مصنوعی بررسی خواهد شد.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="doctorMedicalId" className="block text-sm font-medium text-gray-400 mb-2">شماره نظام پزشکی شما</label>
                    <input type="text" id="doctorMedicalId" value={doctorMedicalId} onChange={e => setDoctorMedicalId(e.target.value)} placeholder="مثال: 12345 (همان شماره ثبت شده در گزارش)" className="w-full bg-black/50 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-600" />
                </div>
                 <div>
                    <label htmlFor="patientNationalId" className="block text-sm font-medium text-gray-400 mb-2">کد ملی بیمار</label>
                    <input type="text" id="patientNationalId" value={patientNationalId} onChange={e => setPatientNationalId(e.target.value)} placeholder="مثال: 0012345678" className="w-full bg-black/50 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-600" />
                </div>
                <div>
                    <label htmlFor="reportId" className="block text-sm font-medium text-gray-400 mb-2">شناسه ۶ رقمی گزارش</label>
                    <input type="text" id="reportId" value={reportId} onChange={e => setReportId(e.target.value)} placeholder="مثال: 123456 (شناسه ۶ رقمی که دریافت کردید)" className="w-full bg-black/50 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-600" />
                </div>
                <div>
                    <label htmlFor="withdrawalReason" className="block text-sm font-medium text-gray-400 mb-2">دلیل پس گرفتن اخطار (با جزئیات کامل)</label>
                    <textarea id="withdrawalReason" value={withdrawalReason} onChange={e => setWithdrawalReason(e.target.value)} rows={5} placeholder="مثال: پس از صحبت مجدد با بیمار و خانواده‌اش، مشخص شد که رفتار پرخاشگرانه او ناشی از یک سوءتفاهم در مورد روند درمان بوده است. بیمار عذرخواهی کرده و متعهد به رفتار مناسب در مراجعات بعدی شده است." className="w-full bg-black/50 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-600"></textarea>
                </div>
                <div>
                    <button type="submit" disabled={isLoading} className="w-full bg-red-700 hover:bg-red-800 disabled:bg-red-900/50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3">
                        {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
                        <span>{isLoading ? 'در حال پردازش...' : 'ارسال درخواست حذف اخطار'}</span>
                    </button>
                </div>
            </form>
            {status && (
                <div className={`mt-6 p-4 border rounded-lg text-sm whitespace-pre-wrap ${statusColor[status.type]}`}>
                    {status.message}
                </div>
            )}
        </div>
    );
};

export default WithdrawWarning;