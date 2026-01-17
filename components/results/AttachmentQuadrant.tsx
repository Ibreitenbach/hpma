'use client';

import { motion } from 'framer-motion';
import type { AttachmentProfile, AttachmentStyle } from '@/types/assessment';

interface AttachmentQuadrantProps {
  profile: AttachmentProfile;
  width?: number;
  height?: number;
}

const STYLE_LABELS: Record<AttachmentStyle, { label: string; description: string; color: string }> = {
  SECURE: {
    label: 'Secure',
    description: 'Comfortable with intimacy and autonomy',
    color: 'text-emerald-600',
  },
  PREOCCUPIED: {
    label: 'Preoccupied',
    description: 'Seeks closeness, fears abandonment',
    color: 'text-amber-600',
  },
  DISMISSIVE: {
    label: 'Dismissive',
    description: 'Values independence, avoids dependency',
    color: 'text-blue-600',
  },
  FEARFUL: {
    label: 'Fearful',
    description: 'Desires closeness but fears rejection',
    color: 'text-rose-600',
  },
};

const QUADRANT_COLORS: Record<AttachmentStyle, string> = {
  SECURE: 'bg-emerald-50',
  PREOCCUPIED: 'bg-amber-50',
  DISMISSIVE: 'bg-blue-50',
  FEARFUL: 'bg-rose-50',
};

export default function AttachmentQuadrant({
  profile,
  width = 320,
  height = 320,
}: AttachmentQuadrantProps) {
  const { anxiety, avoidance, style, confidence } = profile;

  // Normalize to 0-1 scale (from 1-7)
  const normAnxiety = (anxiety - 1) / 6;
  const normAvoidance = (avoidance - 1) / 6;

  // Position within the chart (with padding)
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const dotX = padding + normAvoidance * chartWidth;
  const dotY = padding + (1 - normAnxiety) * chartHeight; // Flip Y axis

  const styleInfo = STYLE_LABELS[style];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl p-5 shadow-lg"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Attachment Style</h3>

      <div className="relative" style={{ width, height }}>
        {/* Quadrant backgrounds */}
        <svg width={width} height={height} className="absolute inset-0">
          {/* Grid background */}
          <rect x={padding} y={padding} width={chartWidth} height={chartHeight} fill="#f8fafc" />

          {/* Quadrant fills */}
          {/* SECURE: bottom-left (low anxiety, low avoidance) */}
          <rect
            x={padding}
            y={padding + chartHeight / 2}
            width={chartWidth / 2}
            height={chartHeight / 2}
            className={style === 'SECURE' ? 'fill-emerald-100' : 'fill-emerald-50/50'}
          />
          {/* PREOCCUPIED: top-left (high anxiety, low avoidance) */}
          <rect
            x={padding}
            y={padding}
            width={chartWidth / 2}
            height={chartHeight / 2}
            className={style === 'PREOCCUPIED' ? 'fill-amber-100' : 'fill-amber-50/50'}
          />
          {/* DISMISSIVE: bottom-right (low anxiety, high avoidance) */}
          <rect
            x={padding + chartWidth / 2}
            y={padding + chartHeight / 2}
            width={chartWidth / 2}
            height={chartHeight / 2}
            className={style === 'DISMISSIVE' ? 'fill-blue-100' : 'fill-blue-50/50'}
          />
          {/* FEARFUL: top-right (high anxiety, high avoidance) */}
          <rect
            x={padding + chartWidth / 2}
            y={padding}
            width={chartWidth / 2}
            height={chartHeight / 2}
            className={style === 'FEARFUL' ? 'fill-rose-100' : 'fill-rose-50/50'}
          />

          {/* Axis lines */}
          <line
            x1={padding}
            y1={padding + chartHeight / 2}
            x2={padding + chartWidth}
            y2={padding + chartHeight / 2}
            stroke="#cbd5e1"
            strokeWidth={1}
            strokeDasharray="4,4"
          />
          <line
            x1={padding + chartWidth / 2}
            y1={padding}
            x2={padding + chartWidth / 2}
            y2={padding + chartHeight}
            stroke="#cbd5e1"
            strokeWidth={1}
            strokeDasharray="4,4"
          />

          {/* Quadrant labels */}
          <text x={padding + chartWidth * 0.25} y={padding + chartHeight * 0.25} textAnchor="middle" className="fill-amber-600/70 text-xs font-medium">
            Preoccupied
          </text>
          <text x={padding + chartWidth * 0.75} y={padding + chartHeight * 0.25} textAnchor="middle" className="fill-rose-600/70 text-xs font-medium">
            Fearful
          </text>
          <text x={padding + chartWidth * 0.25} y={padding + chartHeight * 0.75} textAnchor="middle" className="fill-emerald-600/70 text-xs font-medium">
            Secure
          </text>
          <text x={padding + chartWidth * 0.75} y={padding + chartHeight * 0.75} textAnchor="middle" className="fill-blue-600/70 text-xs font-medium">
            Dismissive
          </text>

          {/* Axis labels */}
          <text x={padding + chartWidth / 2} y={height - 8} textAnchor="middle" className="fill-gray-500 text-xs">
            Avoidance →
          </text>
          <text x={12} y={padding + chartHeight / 2} textAnchor="middle" className="fill-gray-500 text-xs" transform={`rotate(-90, 12, ${padding + chartHeight / 2})`}>
            Anxiety →
          </text>

          {/* Position dot */}
          <motion.circle
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            cx={dotX}
            cy={dotY}
            r={8}
            className="fill-indigo-600"
            stroke="white"
            strokeWidth={3}
          />
        </svg>
      </div>

      {/* Style label and description */}
      <div className="mt-4 text-center">
        <div className={`text-xl font-bold ${styleInfo.color}`}>
          {styleInfo.label}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {styleInfo.description}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Confidence: {(confidence * 100).toFixed(0)}%
          <span className="mx-2">•</span>
          Anxiety: {anxiety.toFixed(1)} | Avoidance: {avoidance.toFixed(1)}
        </div>
      </div>
    </motion.div>
  );
}
