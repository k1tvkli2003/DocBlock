import React from 'react';
import { View } from '../App';

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const SparkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M11.164 2.142a.5.5 0 0 1 .672 0l1.832 1.832a.5.5 0 0 0 .354.146h2.592a.5.5 0 0 1 .5.5v2.592a.5.5 0 0 0 .146.354l1.832 1.832a.5.5 0 0 1 0 .672l-1.832 1.832a.5.5 0 0 0-.146.354v2.592a.5.5 0 0 1-.5.5h-2.592a.5.5 0 0 0-.354.146l-1.832 1.832a.5.5 0 0 1-.672 0l-1.832-1.832a.5.5 0 0 0-.354-.146H6.408a.5.5 0 0 1-.5-.5v-2.592a.5.5 0 0 0-.146-.354L4.03 13.164a.5.5 0 0 1 0-.672l1.832-1.832a.5.5 0 0 0 .146-.354V7.716a.5.5 0 0 1 .5-.5h2.592a.5.5 0 0 0 .354-.146zM12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
  const getTabClass = (view: View) => {
    return activeView === view
      ? 'bg-neutral-800 text-red-400'
      : 'text-gray-400 hover:bg-neutral-800/60 hover:text-white';
  };

  return (
    <header className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
      <div className="flex items-center space-x-3">
        <SparkIcon className="w-10 h-10 text-red-600" />
        <h1 className="text-4xl text-white tracking-wider font-gothic">Doc<span className="text-red-600">Block</span></h1>
      </div>
      <nav className="bg-neutral-950 border border-neutral-800 p-1.5 rounded-lg shadow-md flex space-x-1">
        <button
          onClick={() => setActiveView('search')}
          className={`px-3 py-2 rounded-md font-semibold transition-colors duration-200 ${getTabClass('search')}`}
        >
          جستجوی بیمار
        </button>
        <button
          onClick={() => setActiveView('report')}
          className={`px-3 py-2 rounded-md font-semibold transition-colors duration-200 ${getTabClass('report')}`}
        >
          ثبت اخطار
        </button>
         <button
          onClick={() => setActiveView('withdraw')}
          className={`px-3 py-2 rounded-md font-semibold transition-colors duration-200 ${getTabClass('withdraw')}`}
        >
          پس گرفتن خطا
        </button>
      </nav>
    </header>
  );
};

export default Header;