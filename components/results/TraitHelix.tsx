'use client';

import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { HEXACOProfile, MotiveProfile, AffectProfile } from '@/types/assessment';

interface TraitHelixProps {
  hexaco: HEXACOProfile;
  motives: MotiveProfile;
  affects: AffectProfile;
  width?: number;
  height?: number;
}

interface TraitPoint {
  name: string;
  value: number;
  type: 'trait' | 'motive' | 'affect';
  index: number;
}

const TYPE_COLORS = {
  trait: '#6366f1',   // indigo
  motive: '#06b6d4',  // cyan
  affect: '#ec4899',  // pink
};

export default function TraitHelix({
  hexaco,
  motives,
  affects,
  width = 800,
  height = 400,
}: TraitHelixProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Combine all data points
    const allPoints: TraitPoint[] = [
      ...Object.entries(hexaco).map(([name, value], i) => ({
        name: name.toUpperCase(),
        value,
        type: 'trait' as const,
        index: i,
      })),
      ...Object.entries(motives).map(([name, value], i) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        type: 'motive' as const,
        index: i + 6,
      })),
      ...Object.entries(affects).map(([name, value], i) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        type: 'affect' as const,
        index: i + 12,
      })),
    ];

    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Helix parameters
    const turns = 2.5;
    const amplitude = innerHeight / 4;
    const centerY = innerHeight / 2;

    // X scale based on index
    const xScale = d3.scaleLinear()
      .domain([0, allPoints.length - 1])
      .range([0, innerWidth]);

    // Calculate helix position
    const getHelixY = (index: number, value: number) => {
      const progress = index / (allPoints.length - 1);
      const angle = progress * turns * Math.PI * 2;
      const baseY = centerY + Math.sin(angle) * amplitude * 0.5;
      // Offset by value (1-7 scale, centered at 4)
      const valueOffset = ((value - 4) / 3) * amplitude * 0.5;
      return baseY - valueOffset;
    };

    // Draw helix backbone (two intertwined curves)
    const helixLine1 = d3.line<number>()
      .x(i => xScale(i))
      .y(i => centerY + Math.sin((i / (allPoints.length - 1)) * turns * Math.PI * 2) * amplitude * 0.3)
      .curve(d3.curveBasis);

    const helixLine2 = d3.line<number>()
      .x(i => xScale(i))
      .y(i => centerY - Math.sin((i / (allPoints.length - 1)) * turns * Math.PI * 2) * amplitude * 0.3)
      .curve(d3.curveBasis);

    const indices = d3.range(allPoints.length);

    g.append('path')
      .datum(indices)
      .attr('d', helixLine1)
      .attr('fill', 'none')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 2);

    g.append('path')
      .datum(indices)
      .attr('d', helixLine2)
      .attr('fill', 'none')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 2);

    // Draw connecting lines (rungs of the helix)
    allPoints.forEach((point, i) => {
      const x = xScale(i);
      const y1 = centerY + Math.sin((i / (allPoints.length - 1)) * turns * Math.PI * 2) * amplitude * 0.3;
      const y2 = centerY - Math.sin((i / (allPoints.length - 1)) * turns * Math.PI * 2) * amplitude * 0.3;

      g.append('line')
        .attr('x1', x)
        .attr('y1', y1)
        .attr('x2', x)
        .attr('y2', y2)
        .attr('stroke', '#f3f4f6')
        .attr('stroke-width', 1)
        .attr('opacity', 0.5);
    });

    // Draw data points
    allPoints.forEach((point, i) => {
      const x = xScale(i);
      const y = getHelixY(i, point.value);

      // Point circle
      g.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 0)
        .attr('fill', TYPE_COLORS[point.type])
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .transition()
        .duration(500)
        .delay(i * 50)
        .attr('r', 8);

      // Value inside circle
      g.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '8px')
        .attr('font-weight', '700')
        .attr('fill', '#fff')
        .attr('opacity', 0)
        .text(point.value.toFixed(1))
        .transition()
        .delay(i * 50 + 300)
        .duration(300)
        .attr('opacity', 1);

      // Label below
      g.append('text')
        .attr('x', x)
        .attr('y', y + 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('fill', '#6b7280')
        .attr('opacity', 0)
        .text(point.name)
        .transition()
        .delay(i * 50 + 500)
        .duration(300)
        .attr('opacity', 1);
    });

    // Section labels at top
    const sections = [
      { label: 'TRAITS', start: 0, end: 5, color: TYPE_COLORS.trait },
      { label: 'MOTIVES', start: 6, end: 11, color: TYPE_COLORS.motive },
      { label: 'AFFECTS', start: 12, end: 18, color: TYPE_COLORS.affect },
    ];

    sections.forEach(section => {
      const startX = xScale(section.start);
      const endX = xScale(section.end);
      const midX = (startX + endX) / 2;

      g.append('text')
        .attr('x', midX)
        .attr('y', -15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('fill', section.color)
        .text(section.label);

      g.append('line')
        .attr('x1', startX)
        .attr('x2', endX)
        .attr('y1', -5)
        .attr('y2', -5)
        .attr('stroke', section.color)
        .attr('stroke-width', 2)
        .attr('opacity', 0.5);
    });

  }, [hexaco, motives, affects, width, height]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-xl p-4 shadow-lg"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
        Trait Helix — All 19 Dimensions
      </h3>
      <svg ref={svgRef} width={width} height={height} className="mx-auto" />
    </motion.div>
  );
}
