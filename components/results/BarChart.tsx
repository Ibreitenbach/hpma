'use client';

import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { MotiveProfile, AffectProfile } from '@/types/assessment';

interface BarChartProps {
  data: MotiveProfile | AffectProfile;
  title: string;
  colorScheme?: 'cyan' | 'pink' | 'indigo';
  width?: number;
  height?: number;
}

const COLOR_SCHEMES = {
  cyan: { bar: '#06b6d4', bg: '#cffafe', text: '#0e7490' },
  pink: { bar: '#ec4899', bg: '#fce7f3', text: '#be185d' },
  indigo: { bar: '#6366f1', bg: '#e0e7ff', text: '#4338ca' },
};

const LABELS: Record<string, string> = {
  // Motives
  security: 'Security',
  belonging: 'Belonging',
  status: 'Status',
  mastery: 'Mastery',
  autonomy: 'Autonomy',
  purpose: 'Purpose',
  // Affects
  seeking: 'Seeking',
  fear: 'Fear',
  anger: 'Anger',
  care: 'Care',
  grief: 'Grief',
  play: 'Play',
  desire: 'Desire',
};

export default function BarChart({
  data,
  title,
  colorScheme = 'cyan',
  width = 350,
  height = 250,
}: BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const colors = COLOR_SCHEMES[colorScheme];

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 10, right: 40, bottom: 20, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const entries = Object.entries(data).map(([key, value]) => ({
      key,
      label: LABELS[key] || key,
      value,
    }));

    const xScale = d3.scaleLinear().domain([1, 7]).range([0, innerWidth]);

    const yScale = d3.scaleBand()
      .domain(entries.map(d => d.key))
      .range([0, innerHeight])
      .padding(0.3);

    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Background bars (full scale)
    g.selectAll('.bg-bar')
      .data(entries)
      .enter()
      .append('rect')
      .attr('class', 'bg-bar')
      .attr('x', 0)
      .attr('y', d => yScale(d.key)!)
      .attr('width', innerWidth)
      .attr('height', yScale.bandwidth())
      .attr('fill', colors.bg)
      .attr('rx', 4);

    // Value bars
    g.selectAll('.value-bar')
      .data(entries)
      .enter()
      .append('rect')
      .attr('class', 'value-bar')
      .attr('x', 0)
      .attr('y', d => yScale(d.key)!)
      .attr('width', 0)
      .attr('height', yScale.bandwidth())
      .attr('fill', colors.bar)
      .attr('rx', 4)
      .transition()
      .duration(800)
      .delay((_, i) => i * 100)
      .attr('width', d => xScale(d.value));

    // Labels (left side)
    g.selectAll('.label')
      .data(entries)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', -8)
      .attr('y', d => yScale(d.key)! + yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#374151')
      .text(d => d.label);

    // Value labels (right side of bars)
    g.selectAll('.value')
      .data(entries)
      .enter()
      .append('text')
      .attr('class', 'value')
      .attr('x', d => xScale(d.value) + 6)
      .attr('y', d => yScale(d.key)! + yScale.bandwidth() / 2)
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', colors.text)
      .attr('opacity', 0)
      .text(d => d.value.toFixed(1))
      .transition()
      .duration(300)
      .delay((_, i) => 800 + i * 100)
      .attr('opacity', 1);

  }, [data, width, height, colors]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl p-4 shadow-lg"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <svg ref={svgRef} width={width} height={height} />
    </motion.div>
  );
}
