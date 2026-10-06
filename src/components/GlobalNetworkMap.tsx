import React, { useMemo, useState } from 'react';
import { MapPin, Globe, Zap, ShieldCheck, Activity, RefreshCw } from 'lucide-react';

interface NetworkNode {
  id: string;
  name: string;
  region: 'Asia' | 'Europe' | 'Americas';
  x: number; // 0..1000 SVG coordinate
  y: number; // 0..480 SVG coordinate
  basePingMs: number;
  color: 'emerald' | 'blue' | 'crimson';
  hardware: string;
  ddosCapacity: string;
  labelOffset?: { dx: number; dy: number };
}

const GLOBAL_POP_NODES: NetworkNode[] = [
  {
    id: 'seattle',
    name: 'Seattle',
    region: 'Americas',
    x: 162,
    y: 165,
    basePingMs: 197,
    color: 'blue',
    hardware: 'AMD EPYC 9654 · NVMe Gen5',
    ddosCapacity: '12 Tbps Anycast',
    labelOffset: { dx: 0, dy: 24 },
  },
  {
    id: 'chicago',
    name: 'Chicago',
    region: 'Americas',
    x: 248,
    y: 186,
    basePingMs: 157,
    color: 'blue',
    hardware: 'Ryzen 9 9950X · DDR5 ECC',
    ddosCapacity: '12 Tbps Anycast',
    labelOffset: { dx: 12, dy: 24 },
  },
  {
    id: 'dallas',
    name: 'Dallas',
    region: 'Americas',
    x: 224,
    y: 224,
    basePingMs: 169,
    color: 'blue',
    hardware: 'AMD EPYC 9654 · NVMe Gen5',
    ddosCapacity: '12 Tbps Anycast',
    labelOffset: { dx: 0, dy: 25 },
  },
  {
    id: 'amsterdam',
    name: 'Amsterdam',
    region: 'Europe',
    x: 492,
    y: 152,
    basePingMs: 66,
    color: 'emerald',
    hardware: 'Ryzen 9 9950X · 5.7 GHz',
    ddosCapacity: '18 Tbps Anycast',
    labelOffset: { dx: 0, dy: 22 },
  },
  {
    id: 'frankfurt',
    name: 'Frankfurt',
    region: 'Europe',
    x: 512,
    y: 166,
    basePingMs: 74,
    color: 'emerald',
    hardware: 'Ryzen 9 9950X · DDR5 ECC',
    ddosCapacity: '18 Tbps Anycast',
    labelOffset: { dx: 14, dy: 34 },
  },
  {
    id: 'noida',
    name: 'Noida (Delhi)',
    region: 'Asia',
    x: 682,
    y: 228,
    basePingMs: 9,
    color: 'emerald',
    hardware: 'Ryzen 9 9950X · Tier-4 India',
    ddosCapacity: '20 Tbps Anycast',
    labelOffset: { dx: 0, dy: 22 },
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    region: 'Asia',
    x: 668,
    y: 266,
    basePingMs: 4,
    color: 'emerald',
    hardware: 'Ryzen 9 9950X Flagship Cluster',
    ddosCapacity: '24 Tbps Anycast',
    labelOffset: { dx: -8, dy: 24 },
  },
  {
    id: 'singapore',
    name: 'Singapore',
    region: 'Asia',
    x: 758,
    y: 318,
    basePingMs: 12,
    color: 'emerald',
    hardware: 'Ryzen 9 9950X · SEA Core',
    ddosCapacity: '20 Tbps Anycast',
    labelOffset: { dx: 0, dy: 24 },
  },
];

// Stylized continent polygons in 1000x480 space for generating the dot-matrix world map
const CONTINENT_POLYGONS: Array<Array<[number, number]>> = [
  // North America
  [
    [75, 70],
    [160, 62],
    [255, 75],
    [325, 110],
    [300, 165],
    [265, 220],
    [225, 255],
    [190, 275],
    [160, 235],
    [135, 185],
    [90, 130],
  ],
  // Greenland
  [
    [315, 42],
    [395, 38],
    [410, 82],
    [355, 102],
    [315, 78],
  ],
  // South America
  [
    [235, 278],
    [295, 285],
    [348, 325],
    [335, 385],
    [295, 445],
    [265, 455],
    [250, 395],
    [230, 330],
  ],
  // Europe
  [
    [445, 82],
    [535, 70],
    [595, 85],
    [595, 165],
    [545, 192],
    [465, 192],
    [438, 150],
  ],
  // Africa
  [
    [445, 208],
    [545, 205],
    [605, 245],
    [612, 315],
    [575, 405],
    [525, 418],
    [495, 355],
    [445, 285],
  ],
  // Asia (Mainland + India + SEA)
  [
    [590, 78],
    [740, 68],
    [895, 88],
    [925, 145],
    [865, 225],
    [810, 285],
    [760, 325],
    [720, 275],
    [672, 295],
    [645, 245],
    [595, 205],
  ],
  // Japan / East Island Arc
  [
    [865, 165],
    [895, 175],
    [885, 215],
    [858, 205],
  ],
  // Indonesia / Maritime SEA
  [
    [745, 328],
    [845, 328],
    [860, 358],
    [755, 355],
  ],
  // Australia
  [
    [775, 372],
    [885, 368],
    [905, 425],
    [845, 448],
    [775, 428],
  ],
];

function isPointInPolygon(x: number, y: number, polygon: Array<[number, number]>): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 0.00001) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

const BGP_ROUTES: Array<{ from: string; to: string; controlYOffset: number }> = [
  { from: 'seattle', to: 'chicago', controlYOffset: -28 },
  { from: 'seattle', to: 'dallas', controlYOffset: 18 },
  { from: 'chicago', to: 'dallas', controlYOffset: 12 },
  { from: 'chicago', to: 'amsterdam', controlYOffset: -75 },
  { from: 'amsterdam', to: 'frankfurt', controlYOffset: -14 },
  { from: 'frankfurt', to: 'noida', controlYOffset: -45 },
  { from: 'amsterdam', to: 'mumbai', controlYOffset: -55 },
  { from: 'noida', to: 'mumbai', controlYOffset: -15 },
  { from: 'mumbai', to: 'singapore', controlYOffset: 24 },
  { from: 'noida', to: 'singapore', controlYOffset: -22 },
];

export const GlobalNetworkMap: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('mumbai');
  const [pingJitter, setPingJitter] = useState<Record<string, number>>({});
  const [isPinging, setIsPinging] = useState(false);

  // Precompute dot-matrix world coordinates
  const worldDots = useMemo(() => {
    const dots: Array<{ x: number; y: number }> = [];
    const step = 9;
    for (let x = 45; x <= 955; x += step) {
      for (let y = 36; y <= 456; y += step) {
        const inContinent = CONTINENT_POLYGONS.some((poly) =>
          isPointInPolygon(x, y, poly)
        );
        if (inContinent) {
          dots.push({ x, y });
        }
      }
    }
    return dots;
  }, []);

  const selectedNode =
    GLOBAL_POP_NODES.find((n) => n.id === selectedNodeId) || GLOBAL_POP_NODES[6];

  const handleRunGlobalPing = () => {
    setIsPinging(true);
    setTimeout(() => {
      const nextJitter: Record<string, number> = {};
      GLOBAL_POP_NODES.forEach((node) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        nextJitter[node.id] = Math.max(2, node.basePingMs + delta);
      });
      setPingJitter(nextJitter);
      setIsPinging(false);
    }, 320);
  };

  const getPingForNode = (node: NetworkNode) => {
    return pingJitter[node.id] ?? node.basePingMs;
  };

  return (
    <section
      id="network-map-section"
      className="mx-auto max-w-7xl px-6 py-16"
    >
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="font-mono text-xs font-semibold text-red-400">
            GLOBAL LOW-LATENCY INFRASTRUCTURE · ANYCAST BGP MESH
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            8 Global Points of Presence
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-400">
            Direct Tier-1 peering across Mumbai, Noida (Delhi), Singapore, Europe, and North America with automatic Anycast DDoS mitigation.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunGlobalPing}
          className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-600/15 px-4 py-2.5 font-mono text-xs font-semibold text-white transition-all hover:bg-red-600 hover:border-red-500 whitespace-nowrap"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isPinging ? 'animate-spin' : ''}`} />
          <span>{isPinging ? 'Testing Global Latency...' : 'Ping All 8 Locations'}</span>
        </button>
      </div>

      {/* Main Map Card Container (Matching Screenshot 855) */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#08090f] shadow-[0_25px_70px_rgba(0,0,0,0.85)]">
        {/* Top Operational Status Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0b0d14] px-6 py-3.5 text-xs">
          <div className="flex items-center gap-2.5 font-mono font-bold tracking-wide text-emerald-400">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span>ALL 8 POINTS OF PRESENCE OPERATIONAL</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs text-slate-400">
            <span>
              Routing: <strong className="text-slate-200">Anycast / Low-Ping BGP</strong>
            </span>
            <span className="hidden sm:inline text-slate-600">·</span>
            <span className="hidden sm:inline text-red-400">
              Selected: {selectedNode.name} ({getPingForNode(selectedNode)}ms)
            </span>
          </div>
        </div>

        {/* Interactive Dot-Matrix World Map Viewport */}
        <div className="relative w-full overflow-hidden bg-[#07080d] px-2 py-4 sm:px-6 sm:py-6">
          <svg
            viewBox="0 0 1000 480"
            className="h-auto w-full select-none"
            role="img"
            aria-label="Global Datacenter Map showing 8 Points of Presence across Mumbai, Noida, Singapore, Frankfurt, Amsterdam, Seattle, Chicago, and Dallas"
          >
            <defs>
              <radialGradient id="popEmeraldGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="popBlueGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="bgpArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#ef4444" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.75" />
              </linearGradient>
            </defs>

            {/* Subtle Latitude / Longitude Grid Lines */}
            {[120, 240, 360].map((yLine) => (
              <line
                key={`lat-${yLine}`}
                x1="0"
                y1={yLine}
                x2="1000"
                y2={yLine}
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="1"
              />
            ))}
            {[200, 400, 600, 800].map((xLine) => (
              <line
                key={`lon-${xLine}`}
                x1={xLine}
                y1="0"
                x2={xLine}
                y2="480"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="1"
              />
            ))}

            {/* Dot-Matrix World Continents */}
            <g fill="rgba(148, 163, 184, 0.24)">
              {worldDots.map((dot, idx) => (
                <circle key={idx} cx={dot.x} cy={dot.y} r="1.85" />
              ))}
            </g>

            {/* Curved BGP Anycast Routing Arcs */}
            {BGP_ROUTES.map((route, idx) => {
              const fromNode = GLOBAL_POP_NODES.find((n) => n.id === route.from);
              const toNode = GLOBAL_POP_NODES.find((n) => n.id === route.to);
              if (!fromNode || !toNode) return null;

              const midX = (fromNode.x + toNode.x) / 2;
              const midY = (fromNode.y + toNode.y) / 2 + route.controlYOffset;
              const pathD = `M ${fromNode.x} ${fromNode.y} Q ${midX} ${midY} ${toNode.x} ${toNode.y}`;
              const isHighlighted =
                selectedNodeId === fromNode.id || selectedNodeId === toNode.id;

              return (
                <g key={`${route.from}-${route.to}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke="url(#bgpArcGradient)"
                    strokeWidth={isHighlighted ? '2' : '1.2'}
                    strokeDasharray="5 5"
                    opacity={isHighlighted ? 0.95 : 0.45}
                  />
                  {/* Animated Traveling Packet along BGP Arc */}
                  <circle
                    r={isHighlighted ? '3' : '2'}
                    fill={isHighlighted ? '#10b981' : '#60a5fa'}
                  >
                    <animateMotion
                      dur={`${2.6 + (idx % 3) * 0.7}s`}
                      repeatCount="indefinite"
                      path={pathD}
                    />
                  </circle>
                </g>
              );
            })}

            {/* 8 Global Points of Presence Nodes & Floating Ping Labels */}
            {GLOBAL_POP_NODES.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const ping = getPingForNode(node);
              const isEmerald = node.color === 'emerald';
              const dotColor = isEmerald ? '#10b981' : '#3b82f6';
              const labelText = `${node.name} · ${ping}ms`;
              const labelWidth = Math.max(92, labelText.length * 6.5 + 16);
              const dx = node.labelOffset?.dx || 0;
              const dy = node.labelOffset?.dy || 24;

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className="cursor-pointer"
                >
                  {/* Ambient Radial Glow */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? '32' : '22'}
                    fill={isEmerald ? 'url(#popEmeraldGlow)' : 'url(#popBlueGlow)'}
                  />

                  {/* Outer Concentric Ring */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? '13' : '9'}
                    fill="none"
                    stroke={dotColor}
                    strokeWidth={isSelected ? '1.8' : '1.2'}
                    strokeOpacity={isSelected ? '0.9' : '0.45'}
                  />

                  {/* Core Glowing Node */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? '5.5' : '4.2'}
                    fill={dotColor}
                  />

                  {/* Floating Pill Label (e.g., Mumbai · 4ms, Singapore · 12ms) */}
                  <g transform={`translate(${node.x + dx - labelWidth / 2}, ${node.y + dy - 11})`}>
                    <rect
                      width={labelWidth}
                      height="22"
                      rx="6"
                      fill={isSelected ? 'rgba(220, 38, 38, 0.92)' : 'rgba(13, 16, 26, 0.92)'}
                      stroke={isSelected ? '#f87171' : 'rgba(255,255,255,0.14)'}
                      strokeWidth="1"
                    />
                    <text
                      x={labelWidth / 2}
                      y="14.5"
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="10.5"
                      fontFamily="monospace"
                      fontWeight="700"
                    >
                      {labelText}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Selected Node Hardware & Peering Bar */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0d1018]/90 px-4 py-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-mono font-bold text-white">
                {selectedNode.name} ({selectedNode.region})
              </span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-emerald-400">
                {getPingForNode(selectedNode)}ms Latency
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300">{selectedNode.hardware}</span>
            </div>
            <div className="font-mono text-[11px] text-red-400">
              {selectedNode.ddosCapacity} Mitigation Active
            </div>
          </div>
        </div>

        {/* Bottom 4-Metric Bar (Exact Match to Screenshot 855) */}
        <div className="grid grid-cols-1 gap-4 border-t border-white/10 bg-[#0b0d14] px-6 py-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 shrink-0">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <div className="font-display text-lg font-extrabold text-white">
                8 Global
              </div>
              <div className="font-mono text-[10px] tracking-wider text-slate-400 uppercase">
                POINTS OF PRESENCE
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 shrink-0">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <div className="font-display text-lg font-extrabold text-white">
                3 Continents
              </div>
              <div className="font-mono text-[10px] tracking-wider text-slate-400 uppercase">
                ASIA, EUROPE, AMERICAS
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shrink-0">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="font-display text-lg font-extrabold text-white tabular-nums">
                4ms / 12ms
              </div>
              <div className="font-mono text-[10px] tracking-wider text-slate-400 uppercase">
                LOWEST MEASURED PING
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="font-display text-lg font-extrabold text-white tabular-nums">
                99.99%
              </div>
              <div className="font-mono text-[10px] tracking-wider text-slate-400 uppercase">
                UPTIME SLA GUARANTEED
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
