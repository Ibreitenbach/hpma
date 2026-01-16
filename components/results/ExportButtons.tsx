'use client';

import { motion } from 'framer-motion';
import { AssessmentResult } from '@/types/assessment';
import { downloadJSON, downloadCSV } from '@/lib/export';

interface ExportButtonsProps {
  result: AssessmentResult;
}

export default function ExportButtons({ result }: ExportButtonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="flex flex-wrap justify-center gap-4 mt-8"
    >
      <button
        onClick={() => downloadJSON(result)}
        className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download JSON
      </button>

      <button
        onClick={() => downloadCSV(result)}
        className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download CSV
      </button>

      <button
        onClick={() => {
          if (confirm('Start a new assessment? This will clear your current results.')) {
            sessionStorage.removeItem('hpma-result');
            window.location.href = '/';
          }
        }}
        className="flex items-center gap-2 px-6 py-3 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Retake Assessment
      </button>
    </motion.div>
  );
}
