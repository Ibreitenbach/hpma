'use client';

import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { HEXACOProfile, MotiveProfile, AffectProfile, GraphNode, GraphEdge } from '@/types/assessment';

interface HypergraphProps {
  hexaco: HEXACOProfile;
  motives: MotiveProfile;
  affects: AffectProfile;
  width?: number;
  height?: number;
}

// Theoretical correlations between constructs
const CORRELATIONS: Array<{ source: string; target: string; weight: number }> = [
  { source: 'O', target: 'seeking', weight: 0.7 },
  { source: 'O', target: 'purpose', weight: 0.5 },
  { source: 'C', target: 'mastery', weight: 0.6 },
  { source: 'A', target: 'care', weight: 0.7 },
  { source: 'A', target: 'belonging', weight: 0.5 },
  { source: 'E', target: 'fear', weight: 0.6 },
  { source: 'E', target: 'grief', weight: 0.5 },
  { source: 'X', target: 'play', weight: 0.6 },
  { source: 'X', target: 'status', weight: 0.4 },
  { source: 'security', target: 'fear', weight: 0.5 },
  { source: 'autonomy', target: 'seeking', weight: 0.4 },
  { source: 'belonging', target: 'grief', weight: 0.4 },
  { source: 'mastery', target: 'seeking', weight: 0.3 },
  { source: 'status', target: 'anger', weight: 0.3 },
  { source: 'purpose', target: 'care', weight: 0.4 },
  { source: 'H', target: 'care', weight: 0.4 },
  { source: 'desire', target: 'seeking', weight: 0.3 },
  { source: 'play', target: 'belonging', weight: 0.3 },
];

const TYPE_COLORS = {
  trait: '#6366f1',
  motive: '#06b6d4',
  affect: '#ec4899',
};

export default function Hypergraph({
  hexaco,
  motives,
  affects,
  width = 700,
  height = 500,
}: HypergraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Build nodes
    const nodes: GraphNode[] = [
      ...Object.entries(hexaco).map(([id, value]) => ({
        id,
        label: id.toUpperCase(),
        type: 'trait' as const,
        value,
      })),
      ...Object.entries(motives).map(([id, value]) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        type: 'motive' as const,
        value,
      })),
      ...Object.entries(affects).map(([id, value]) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        type: 'affect' as const,
        value,
      })),
    ];

    // Build edges (only include edges where both nodes exist)
    const nodeIds = new Set(nodes.map(n => n.id));
    const edges: GraphEdge[] = CORRELATIONS
      .filter(c => nodeIds.has(c.source) && nodeIds.has(c.target))
      .map(c => ({
        source: c.source,
        target: c.target,
        weight: c.weight,
      }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(edges)
        .id((d: unknown) => (d as GraphNode).id)
        .distance(100)
        .strength((d: unknown) => (d as GraphEdge).weight * 0.5))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Edge scale based on weight
    const edgeScale = d3.scaleLinear().domain([0.2, 0.8]).range([1, 4]);
    const edgeOpacity = d3.scaleLinear().domain([0.2, 0.8]).range([0.2, 0.6]);

    // Node size scale based on value
    const nodeScale = d3.scaleLinear().domain([1, 7]).range([15, 30]);

    const g = svg.append('g');

    // Draw edges
    const links = g.selectAll('.link')
      .data(edges)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', '#9ca3af')
      .attr('stroke-width', d => edgeScale(d.weight))
      .attr('stroke-opacity', d => edgeOpacity(d.weight));

    // Node groups
    const nodeGroups = g.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Node circles
    nodeGroups.append('circle')
      .attr('r', d => nodeScale(d.value))
      .attr('fill', d => TYPE_COLORS[d.type])
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.9);

    // Node labels
    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('fill', '#fff')
      .text(d => d.label.length > 3 ? d.label.substring(0, 3) : d.label);

    // Tooltip
    const tooltip = d3.select('body').selectAll('.hypergraph-tooltip').data([null]).join('div')
      .attr('class', 'hypergraph-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(255, 255, 255, 0.95)')
      .style('padding', '8px 12px')
      .style('border-radius', '8px')
      .style('box-shadow', '0 4px 12px rgba(0,0,0,0.15)')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('display', 'none');

    nodeGroups
      .on('mouseover', (event, d) => {
        tooltip.style('display', 'block')
          .html(`<strong>${d.label}</strong><br/>Score: ${d.value.toFixed(2)}<br/>Type: ${d.type}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      })
      .on('mouseout', () => tooltip.style('display', 'none'));

    // Update positions on tick
    simulation.on('tick', () => {
      links
        .attr('x1', d => (d.source as unknown as GraphNode).x!)
        .attr('y1', d => (d.source as unknown as GraphNode).y!)
        .attr('x2', d => (d.target as unknown as GraphNode).x!)
        .attr('y2', d => (d.target as unknown as GraphNode).y!);

      nodeGroups
        .attr('transform', d => `translate(${d.x}, ${d.y})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [hexaco, motives, affects, width, height]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white rounded-xl p-4 shadow-lg"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
        Personality Hypergraph — Construct Relationships
      </h3>
      <p className="text-xs text-gray-500 text-center mb-2">
        Node size = score magnitude • Edge thickness = theoretical correlation • Drag to explore
      </p>
      <svg ref={svgRef} width={width} height={height} className="mx-auto" />
      <div className="flex justify-center gap-6 mt-2 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-indigo-500"></span> Traits
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-cyan-500"></span> Motives
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-pink-500"></span> Affects
        </span>
      </div>
    </motion.div>
  );
}
