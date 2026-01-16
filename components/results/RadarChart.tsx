'use client';

import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { HEXACOProfile } from '@/types/assessment';

interface RadarChartProps {
  data: HEXACOProfile;
  width?: number;
  height?: number;
}

const LABELS: Record<keyof HEXACOProfile, string> = {
  H: 'Honesty-Humility',
  E: 'Emotionality',
  X: 'Extraversion',
  A: 'Agreeableness',
  C: 'Conscientiousness',
  O: 'Openness',
};

export default function RadarChart({ data, width = 400, height = 400 }: RadarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = 60;
    const radius = Math.min(width, height) / 2 - margin;
    const centerX = width / 2;
    const centerY = height / 2;

    const traits = Object.keys(data) as (keyof HEXACOProfile)[];
    const numTraits = traits.length;
    const angleSlice = (Math.PI * 2) / numTraits;

    // Scale for the radius (1-7 scale)
    const rScale = d3.scaleLinear().domain([1, 7]).range([0, radius]);

    const g = svg.append('g').attr('transform', `translate(${centerX}, ${centerY})`);

    // Draw circular grid
    const levels = 6;
    for (let level = 1; level <= levels; level++) {
      const levelValue = 1 + level;
      g.append('circle')
        .attr('r', rScale(levelValue))
        .attr('fill', 'none')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1);
    }

    // Draw axis lines
    traits.forEach((_, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', radius * Math.cos(angle))
        .attr('y2', radius * Math.sin(angle))
        .attr('stroke', '#d1d5db')
        .attr('stroke-width', 1);
    });

    // Draw labels
    traits.forEach((trait, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const labelRadius = radius + 30;
      const x = labelRadius * Math.cos(angle);
      const y = labelRadius * Math.sin(angle);

      g.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', '500')
        .attr('fill', '#374151')
        .text(LABELS[trait]);
    });

    // Create the radar polygon
    const lineGenerator = d3.lineRadial<{ trait: keyof HEXACOProfile; value: number }>()
      .angle((_, i) => angleSlice * i)
      .radius(d => rScale(d.value))
      .curve(d3.curveLinearClosed);

    const dataPoints = traits.map(trait => ({ trait, value: data[trait] }));

    // Filled area
    g.append('path')
      .datum(dataPoints)
      .attr('d', lineGenerator as unknown as string)
      .attr('fill', 'rgba(99, 102, 241, 0.3)')
      .attr('stroke', '#6366f1')
      .attr('stroke-width', 2)
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .attr('opacity', 1);

    // Data points
    traits.forEach((trait, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const value = data[trait];
      const x = rScale(value) * Math.cos(angle);
      const y = rScale(value) * Math.sin(angle);

      g.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 5)
        .attr('fill', '#6366f1')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('opacity', 0)
        .transition()
        .delay(800)
        .duration(300)
        .attr('opacity', 1);

      // Value label
      g.append('text')
        .attr('x', x)
        .attr('y', y - 12)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('fill', '#4f46e5')
        .attr('opacity', 0)
        .text(value.toFixed(1))
        .transition()
        .delay(1000)
        .duration(300)
        .attr('opacity', 1);
    });

  }, [data, width, height]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl p-4 shadow-lg"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">HEXACO Traits</h3>
      <svg ref={svgRef} width={width} height={height} className="mx-auto" />
    </motion.div>
  );
}
