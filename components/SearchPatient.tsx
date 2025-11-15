
import React, { useState, useCallback } from 'react';
import { usePatientContext } from '../context/PatientContext';
import { Patient, GroundingSource } from '../types';
import { searchPublicInfo } from '../services/geminiService';

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);

const PUBLIC_INFO_NOT_FOUND = "هیچ اطلاعات عمومی مرتبطی یافت نشد.";

const SearchPatient: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [internalResult, setInternalResult] = useState<Patient | null>(null);
    const [publicResult, setPublicResult] = useState<{ summary: string; sources: GroundingSource[] } | null>(null);
    const { findPatient } = usePatientContext();

    const handleSearch = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setSearched(true);
        setInternalResult(null);
        setPublicResult(null);

        // Internal search
        const foundPatient = findPatient(query);
        setInternalResult(foundPatient ?? null);

        // Public info search (async)
        const publicInfo = await searchPublicInfo(foundPatient?.name || query, foundPatient?.nationalId || query);
        setPublicResult(publicInfo);

        setIsLoading(false);
    }, [query, findPatient]);

    const renderResults = () => {
        if (isLoading) {
            return <div className="text-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div><p className="mt-4">در حال جستجو...</p></div>;
        }

        if (!searched) {
            return <div className="text-center p-8 text-gray-500">برای مشاهده سوابق، نام یا کد ملی بیمار را وارد کنید.</div>;
        }

        const showPublicInfo = publicResult && publicResult.summary && publicResult.summary.trim() !== PUBLIC_INFO_NOT_FOUND;

        if (!internalResult && !showPublicInfo) {
            return <div className="text-center p-8 text-gray-400">هیچ اخطار ثبت شده یا اطلاعات عمومی نگران‌کننده‌ای برای این بیمار یافت نشد.</div>;
        }

        return (
            <div className="space-y-6 mt-6">
                {internalResult && (
                    <div className="bg-neutral-900 p-6 rounded-lg shadow-lg border border-red-700">
                        <h3 className="text-xl font-bold text-red-500 mb-4">اخطارهای ثبت شده داخلی</h3>
                        <p className="text-lg"><span className="font-semibold">نام:</span> {internalResult.name}</p>
                        <p className="text-lg"><span className="font-semibold">کد ملی:</span> {internalResult.nationalId}</p>
                        <div className="mt-4 space-y-4">
                            {internalResult.warnings.map(warning => (
                               <div key={warning.id} className="bg-black/50 p-4 rounded-lg border border-neutral-700 transition-shadow hover:shadow-red-900/20 hover:shadow-lg">
                                    <blockquote className="border-r-4 border-red-600 pr-4 text-gray-300 italic space-y-2">
                                        {warning.reason.split('\n\n').map((part, index) => (
                                            <p key={index} className="text-justify leading-relaxed">{part}</p>
                                        ))}
                                    </blockquote>
                                    <div className="text-xs text-gray-500 mt-4 pt-3 border-t border-neutral-800 flex justify-between items-center">
                                        <span>تاریخ ثبت: <span className="font-mono text-gray-400">{warning.date}</span></span>
                                        <span className="font-semibold">شناسه گزارش: <span className="font-mono text-gray-400 tracking-wider">{warning.id}</span></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {showPublicInfo && (
                    <div className="bg-neutral-900 p-6 rounded-lg shadow-lg border border-amber-600/60">
                        <h3 className="text-xl font-bold text-amber-400 mb-4">اطلاعات یافت شده در منابع عمومی (Google Search)</h3>
                        <p className="whitespace-pre-wrap leading-relaxed">{publicResult.summary}</p>
                        {publicResult.sources.length > 0 && (
                             <div className="mt-4">
                                <h4 className="font-semibold text-gray-300">منابع:</h4>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    {publicResult.sources.map((source, index) => source.web && (
                                        <li key={index}>
                                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                                {source.web.title || source.web.uri}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-neutral-950 p-6 md:p-8 rounded-xl shadow-2xl border border-neutral-800">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-200">جستجوی سوابق بیمار</h2>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="نام یا کد ملی بیمار را وارد کنید..."
                    className="flex-grow bg-black/50 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex justify-center items-center gap-2 bg-red-700 hover:bg-red-800 disabled:bg-red-900/50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                    <SearchIcon className="w-5 h-5"/>
                    <span>{isLoading ? 'جستجو...' : 'جستجو'}</span>
                </button>
            </form>

            <div className="mt-8 min-h-[10rem]">
                {renderResults()}
            </div>
        </div>
    );
};

export default SearchPatient;
