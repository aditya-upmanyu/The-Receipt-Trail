/**
 * Connections Page — Interactive force-directed graph visualizing moment relationships.
 * Nodes represent detected LifeMoments; edges connect temporally adjacent or receipt-sharing moments.
 * Side panel shows moment summary, participating receipts, and the parent chapter for a selected node.
 */

import { useState, useMemo } from "react";
import { Network, BookOpen, Clock } from "lucide-react";
import type { Receipt, LifeMoment, Chapter } from "../types/index";
import { getCategoryColor, formatDate } from "../utils/helpers";

interface ConnectionsProps {
  moments: LifeMoment[];
  receipts?: Receipt[];
  chapters?: Chapter[];
}

interface GraphNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  connections: number;
  data: Receipt | LifeMoment;
}

export function Connections({ moments, receipts = [], chapters = [] }: ConnectionsProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Build graph from top 30 moments for performance
  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [];
    const edges: Array<{ source: string; target: string; strength: number }> = [];

    const topMoments = moments.slice(0, 30);

    topMoments.forEach((moment, i) => {
      const angle = (i / topMoments.length) * 2 * Math.PI;
      const radius = 200;
      const centerX = 400;
      const centerY = 300;

      nodes.push({
        id: moment.id,
        type: "moment",
        label: moment.title,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        connections: moment.connections.length,
        data: moment,
      });
    });

    for (let i = 0; i < topMoments.length; i++) {
      for (let j = i + 1; j < topMoments.length; j++) {
        const m1 = topMoments[i];
        const m2 = topMoments[j];
        const sharedReceipts = m1.receiptIds.filter((id) => m2.receiptIds.includes(id)).length;
        const hoursDiff =
          Math.abs(m1.startTime.getTime() - m2.startTime.getTime()) / (1000 * 60 * 60);

        if (sharedReceipts > 0 || hoursDiff < 24) {
          edges.push({
            source: m1.id,
            target: m2.id,
            strength: sharedReceipts > 0 ? 2 : 1,
          });
        }
      }
    }

    return { nodes, edges };
  }, [moments]);

  /** Find the parent chapter for a given moment id */
  const findParentChapter = (momentId: string): Chapter | undefined =>
    chapters.find((ch) => ch.moments.some((m) => m.id === momentId));

  /** Sample receipts belonging to a moment (capped at 3 for display) */
  const momentReceipts = useMemo<Receipt[]>(() => {
    if (!selectedNode || selectedNode.type !== "moment") return [];
    const moment = selectedNode.data as LifeMoment;
    const idSet = new Set(moment.receiptIds);
    return receipts.filter((r) => idSet.has(r.id)).slice(0, 3);
  }, [selectedNode, receipts]);

  if (moments.length === 0) {
    return (
      <div className="min-h-screen bg-[#05070B] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Network className="w-16 h-16 text-[#94A3B8] mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-[#E8F1FF] mb-2">NO CONNECTIONS YET</h2>
          <p className="text-[#94A3B8]">
            Not enough receipts to detect meaningful connections. Keep exploring!
          </p>
        </div>
      </div>
    );
  }

  const selectedMoment = selectedNode?.type === "moment"
    ? (selectedNode.data as LifeMoment)
    : null;
  const parentChapter = selectedNode ? findParentChapter(selectedNode.id) : undefined;

  return (
    <div className="min-h-screen bg-[#05070B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[#E8F1FF] mb-2">Connections</h1>
        <p className="text-[#94A3B8] mb-8">
          {graphData.nodes.length} moments · {graphData.edges.length} connections
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Graph visualization */}
          <div className="lg:col-span-2">
            <div className="bg-[#080B12] border border-[#2e303a] rounded-lg p-6 overflow-hidden">
              <svg
                viewBox="0 0 800 600"
                className="w-full h-auto"
                style={{ minHeight: "500px" }}
                aria-label="Moment connection graph"
                role="img"
              >
                {/* Edges */}
                <g>
                  {graphData.edges.map((edge, i) => {
                    const source = graphData.nodes.find((n) => n.id === edge.source);
                    const target = graphData.nodes.find((n) => n.id === edge.target);
                    if (!source || !target) return null;

                    return (
                      <line
                        key={i}
                        x1={source.x}
                        y1={source.y}
                        x2={target.x}
                        y2={target.y}
                        stroke="#2e303a"
                        strokeWidth={edge.strength}
                        opacity={
                          selectedNode
                            ? selectedNode.id === source.id || selectedNode.id === target.id
                              ? 0.6
                              : 0.2
                            : 0.4
                        }
                      />
                    );
                  })}
                </g>

                {/* Nodes */}
                <g>
                  {graphData.nodes.map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    const isConnectedToSelected = selectedNode
                      ? graphData.edges.some(
                          (e) =>
                            (e.source === selectedNode.id && e.target === node.id) ||
                            (e.target === selectedNode.id && e.source === node.id)
                        )
                      : false;

                    const opacity =
                      !selectedNode || isSelected || isConnectedToSelected ? 1 : 0.3;

                    return (
                      <g
                        key={node.id}
                        onClick={() => setSelectedNode(isSelected ? null : node)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedNode(isSelected ? null : node);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Select moment: ${node.label}`}
                        aria-pressed={isSelected}
                        style={{ cursor: "pointer", outline: "none" }}
                        opacity={opacity}
                      >
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={8 + node.connections}
                          fill={node.type === "moment" ? "#06B6D4" : getCategoryColor("music")}
                          stroke={isSelected ? "#E8F1FF" : "transparent"}
                          strokeWidth={isSelected ? 2 : 0}
                        />
                        {isSelected && (
                          <text
                            x={node.x}
                            y={node.y - 15}
                            textAnchor="middle"
                            fill="#E8F1FF"
                            fontSize="12"
                            fontWeight="500"
                          >
                            {node.label.slice(0, 20)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>

          {/* Side panel */}
          <div className="lg:col-span-1">
            <div className="bg-[#080B12] border border-[#2e303a] rounded-lg p-6 sticky top-8">
              {selectedNode && selectedMoment ? (
                <div>
                  <h3 className="text-lg font-semibold text-[#E8F1FF] mb-4">
                    {selectedNode.label}
                  </h3>

                  <div className="space-y-4">
                    {/* Temporal span */}
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-[#94A3B8] mt-0.5 shrink-0" aria-hidden="true" />
                      <div>
                        <p className="text-xs text-[#94A3B8] mb-0.5">Time span</p>
                        <p className="text-sm text-[#E8F1FF]">
                          {formatDate(selectedMoment.startTime)}
                        </p>
                      </div>
                    </div>

                    {/* Summary */}
                    <div>
                      <p className="text-xs text-[#94A3B8] mb-1">Summary</p>
                      <p className="text-sm text-[#E8F1FF] leading-relaxed">
                        {selectedMoment.summary}
                      </p>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#0D111A] rounded p-2 border border-[#2e303a]">
                        <p className="text-lg font-bold text-cyan-400">
                          {selectedMoment.receipts.length}
                        </p>
                        <p className="text-xs text-[#94A3B8]">Receipts</p>
                      </div>
                      <div className="bg-[#0D111A] rounded p-2 border border-[#2e303a]">
                        <p className="text-lg font-bold text-cyan-400">
                          {selectedNode.connections}
                        </p>
                        <p className="text-xs text-[#94A3B8]">Connections</p>
                      </div>
                    </div>

                    {/* Sample receipts */}
                    {momentReceipts.length > 0 && (
                      <div>
                        <p className="text-xs text-[#94A3B8] mb-2">Sample activities</p>
                        <ul className="space-y-1">
                          {momentReceipts.map((r) => (
                            <li
                              key={r.id}
                              className="text-xs text-[#E8F1FF] bg-[#0D111A] rounded px-2 py-1 border border-[#2e303a] truncate"
                              title={r.title}
                            >
                              {r.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Parent chapter */}
                    {parentChapter && (
                      <div className="flex items-start gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded p-3">
                        <BookOpen
                          className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0"
                          aria-hidden="true"
                        />
                        <div>
                          <p className="text-xs text-cyan-400 mb-0.5">Part of chapter</p>
                          <p className="text-sm font-medium text-[#E8F1FF]">
                            {parentChapter.title}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedNode(null)}
                    className="mt-6 w-full px-4 py-2 bg-[#0D111A] hover:bg-[#16171d] text-[#E8F1FF] rounded-lg transition-colors text-sm"
                  >
                    Deselect
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Network className="w-12 h-12 text-[#94A3B8] mx-auto mb-4" aria-hidden="true" />
                  <p className="text-[#94A3B8] text-sm">
                    Click on a node to see moment details, receipts, and its parent chapter
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
