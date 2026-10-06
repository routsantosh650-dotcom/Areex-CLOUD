import React, { useState } from 'react';
import { MapPin, Globe2, Zap, ShieldCheck, Activity } from 'lucide-react';

interface PopNode {
  id: string;
  city: string;
  ping: string;
  region: string;
  cpu: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  primary: boolean;
}

const POP_NODES: PopNode[] = [
  {
    id: 'seattle',
    city: 'Seattle',
    ping: '197ms',
    region: 'US West · Anycast Edge',
    cpu: 'AMD EPYC 7B13 · 10 Gbps',
    x: 17.5,
    y: 41,
    primary: false,
  },
  {
    id: 'chicago',
    city: 'Chicago',
    ping: '157ms',
    region: 'US Central · BGP Scrubbing',
    cpu: 'AMD EPYC 7B13 · 10 Gbps',
    x: 27.5,
    y: 44.5,
    primary: false,
  },
  {
    id: 'dallas',
    city: 'Dallas',
    ping: '169ms',
    region: 'US South · Anycast Edge',
    cpu: 'Intel Xeon Gold · 10 Gbps',
    x: 24.5,
    y: 51,
    primary: false,
  },
  {
    id: 'amsterdam',
    city: 'Amsterdam',
    ping: '66ms',
    region: 'Europe West · AMS-IX Peering',
    cpu: 'AMD Ryzen 9 9950X · 10 Gbps',
    x: 50.5,
    y: 38.5,
    primary: false,
  },
  {
    id: 'frankfurt',
    city: 'Frankfurt',
    ping: '15ms',
    region: 'Europe Central · DE-CIX Core',
    cpu: 'AMD Ryzen 9 9950X · 17.2 Tbps DDoS',
    x: 53.2,
    y: 42.5,
    primary: true,
  },
  {
    id: 'noida',
    city: 'Noida (Delhi)',
    ping: '9ms',
    region: 'India North · Direct Jio/Airtel',
    cpu: 'AMD EPYC 7B13 + Ryzen 9 · 12 Tbps DDoS',
    x: 68.2,
    y: 50,
    primary: true,
  },
  {
    id: 'mumbai',
    city: 'Mumbai',
    ping: '4ms',
    region: 'India West Flagship · Sub-5ms Gaming',
    cpu: 'Liquid-Cooled Ryzen 9 9950X · 17.2 Tbps DDoS',
    x: 66.8,
    y: 57.5,
    primary: true,
  },
  {
    id: 'singapore',
    city: 'Singapore',
    ping: '12ms',
    region: 'Asia-Pacific Hub · Subsea Fiber',
    cpu: 'AMD Ryzen 9 9950X + Gen5 NVMe',
    x: 75.5,
    y: 64.5,
    primary: true,
  },
];

export const GlobalNetworkMapSection: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<PopNode>(POP_NODES[6]); // Default Mumbai 4ms

  return (
    <section
      id="network-map-section"
      className="border-b border-white/10 bg-[#080507] py-20"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Heading */}
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="font-mono text-xs text-red-400">
              GLOBAL INFRASTRUCTURE · LOW-PING ANYCAST BGP
            </div>
            <h2
              style={{ textWrap: 'balance' }}
              className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              8 Global Points of Presence · Ultra-Low Indian Ping
            </h2>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#12090e] px-4 py-2.5 font-mono text-xs text-slate-300">
            <span className="text-red-400 font-bold">{selectedNode.city}</span>
            <span className="mx-2 text-slate-600">·</span>
            <span className="text-emerald-400 font-bold">{selectedNode.ping}</span>
            <span className="mx-2 text-slate-600">·</span>
            <span className="text-slate-400">{selectedNode.cpu}</span>
          </div>
        </div>

        {/* Main World Map Container Card (Matching Screenshot 855) */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0a070b] shadow-[0_25px_70px_rgba(0,0,0,0.85)]">
          {/* Top Status Bar inside Map Card */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0d080c] px-6 py-3.5 font-mono text-xs">
            <div className="flex items-center gap-2.5 text-emerald-400 font-semibold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span>ALL 8 POINTS OF PRESENCE OPERATIONAL</span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <Activity className="h-3.5 w-3.5 text-red-400" />
              <span>Routing:</span>
              <span className="text-slate-200 font-semibold">
                Anycast + Low-Ping BGP
              </span>
            </div>
          </div>

          {/* Interactive Dotted World Map Viewport */}
          <div className="relative aspect-[16/8.2] min-h-[340px] w-full overflow-hidden bg-[#08060a]">
            {/* Subtle Coordinate Grid Lines */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
                backgroundSize: '80px 80px',
              }}
            />

            {/* Dotted Continents + Animated BGP Routing Arcs SVG */}
            <svg
              viewBox="0 0 1000 500"
              className="h-full w-full select-none"
              aria-label="Global Points of Presence World Map"
            >
              <defs>
                {/* Dotted matrix pattern for world continents */}
                <pattern
                  id="continent-dots"
                  x="0"
                  y="0"
                  width="8"
                  height="8"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2.5" cy="2.5" r="1.55" fill="rgba(148, 163, 184, 0.28)" />
                </pattern>

                <linearGradient id="bgp-arc-crimson" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.15" />
                  <stop offset="50%" stopColor="#ef4444" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.85" />
                </linearGradient>

                <linearGradient id="bgp-arc-blue" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.75" />
                </linearGradient>
              </defs>

              {/* Stylized World Continents filled with high-tech dot matrix */}
              <g fill="url(#continent-dots)">
                {/* North America */}
                <path d="M75,85 L195,70 L315,110 L335,175 L285,235 L235,275 L195,260 L150,215 L125,165 Z" />
                {/* Greenland */}
                <path d="M325,45 L415,40 L395,95 L335,90 Z" />
                {/* South America */}
                <path d="M255,285 L335,295 L375,355 L345,445 L295,475 L265,410 L245,335 Z" />
                {/* Europe */}
                <path d="M445,95 L575,80 L610,145 L565,205 L465,195 L435,145 Z" />
                {/* Africa */}
                <path d="M445,215 L575,215 L625,285 L595,415 L525,445 L485,365 L435,285 Z" />
                {/* Asia (Including India & SE Asia) */}
                <path d="M585,85 L875,75 L925,155 L865,265 L785,335 L735,315 L675,310 L650,260 L605,215 Z" />
                {/* India Subcontinent Highlight */}
                <path d="M645,235 L705,235 L685,315 L655,305 Z" />
                {/* Australia */}
                <path d="M775,355 L895,350 L915,425 L835,455 L770,415 Z" />
              </g>

              {/* Dashed & Animated Curved BGP Fiber Arcs between Global PoPs */}
              <g fill="none" strokeWidth="1.6" strokeDasharray="5 5">
                {/* Seattle -> Chicago -> Amsterdam */}
                <path
                  d="M175,205 Q225,180 275,222"
                  stroke="url(#bgp-arc-blue)"
                />
                <path
                  d="M275,222 Q390,125 505,192"
                  stroke="url(#bgp-arc-blue)"
                />
                {/* Dallas -> Chicago */}
                <path
                  d="M245,255 Q260,238 275,222"
                  stroke="url(#bgp-arc-blue)"
                />
                {/* Amsterdam -> Frankfurt -> Noida -> Mumbai -> Singapore */}
                <path
                  d="M505,192 Q520,200 532,212"
                  stroke="url(#bgp-arc-crimson)"
                />
                <path
                  d="M532,212 Q615,185 682,250"
                  stroke="url(#bgp-arc-crimson)"
                />
                <path
                  d="M682,250 Q672,270 668,287"
                  stroke="#10b981"
                  strokeWidth="2.2"
                  strokeDasharray="none"
                />
                <path
                  d="M668,287 Q715,310 755,322"
                  stroke="url(#bgp-arc-crimson)"
                />
                <path
                  d="M682,250 Q730,275 755,322"
                  stroke="url(#bgp-arc-crimson)"
                />
              </g>
            </svg>

            {/* Interactive HTML Node Markers Overlaid at Exact Coordinates */}
            {POP_NODES.map((node) => {
              const isSelected = selectedNode.id === node.id;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNode(node)}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                  aria-label={`${node.city} datacenter node, ping ${node.ping}`}
                >
                  {/* Glowing Dot */}
                  <div className="relative flex items-center justify-center">
                    <span
                      className={`absolute h-6 w-6 rounded-full transition-transform duration-300 group-hover:scale-125 ${
                        node.primary
                          ? 'bg-emerald-500/25 animate-ping'
                          : 'bg-sky-500/20'
                      }`}
                    />
                    <span
                      className={`relative h-3 w-3 rounded-full border-2 transition-transform ${
                        isSelected ? 'scale-125 ring-4 ring-red-500/40' : ''
                      } ${
                        node.primary
                          ? 'border-emerald-200 bg-emerald-400 shadow-[0_0_15px_#10b981]'
                          : 'border-sky-200 bg-sky-400 shadow-[0_0_12px_#38bdf8]'
                      }`}
                    />
                  </div>

                  {/* Pill Label under Node (Matching Screenshot 855) */}
                  <div
                    className={`mt-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold shadow-lg backdrop-blur-md transition-all ${
                      isSelected
                        ? 'border-red-500 bg-red-950/90 text-white'
                        : 'border-white/10 bg-[#0d0a12]/90 text-slate-200 group-hover:border-white/30'
                    }`}
                  >
                    <span>{node.city}</span>
                    <span className="mx-1 text-slate-500">·</span>
                    <span className={node.primary ? 'text-emerald-400' : 'text-sky-400'}>
                      {node.ping}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom 4-Metric Bar inside Map Card (Matching Screenshot 855) */}
          <div className="grid grid-cols-2 gap-4 border-t border-white/10 bg-[#0d080c] px-6 py-5 sm:grid-cols-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-600/10 text-red-400">
                <MapPin className="h-5 w-5" />
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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-600/10 text-red-400">
                <Globe2 className="h-5 w-5" />
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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-lg font-extrabold text-white">
                  4ms
                </div>
                <div className="font-mono text-[10px] tracking-wider text-slate-400 uppercase">
                  LOWEST MEASURED PING
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-600/10 text-red-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-lg font-extrabold text-white">
                  99.99%
                </div>
                <div className="font-mono text-[10px] tracking-wider text-slate-400 uppercase">
                  UPTIME SLA GUARANTEED
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
