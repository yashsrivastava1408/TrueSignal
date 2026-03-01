import React from 'react';
import { ChevronRight, Award, Layers, Cpu, ShieldCheck, Zap, ArrowRight, Activity } from 'lucide-react';

const PIPELINE_NODES = [
    { label: 'Event Streams', sub: 'GPS & FOR Signals', icon: '📱', color: 'blue' },
    { label: 'RIC Engine', sub: 'Bias Triangulation', icon: '📐', color: 'purple' },
    { label: 'HKL Injector', sub: 'Dineout Proxy', icon: '🏢', color: 'orange' },
    { label: 'State Layer', sub: 'SQS History', icon: '🗄️', color: 'green' },
    { label: 'Inference', sub: 'Augmented KPT', icon: '🧠', color: 'zomato' },
];

const SIGNAL_LAYERS = [
    {
        title: 'RIC Engine',
        phase: 'Signal Truth',
        color: 'blue',
        icon: <Activity className="w-5 h-5" />,
        items: [
            'Haversine geofence verification',
            'Rider-Merchant proximity detection',
            'Visual-gaming bias coefficient',
        ],
    },
    {
        title: 'Hidden Load (HKL)',
        phase: 'Ecosystem Sync',
        color: 'orange',
        icon: <Cpu className="w-5 h-5" />,
        items: [
            'Real-time Dineout occupancy streams',
            'Non-delivery kitchen pressure proxy',
            'Cross-platform congestion multiplier',
        ],
    },
    {
        title: 'Quality Index (SQS)',
        phase: 'Merchant Trust',
        color: 'green',
        icon: <ShieldCheck className="w-5 h-5" />,
        items: [
            'Rolling Signal Quality Score (SQS)',
            'Reliability-based Accuracy Tiers',
            'Dynamic trust decay algorithms',
        ],
    },
    {
        title: 'Aware Dispatch (SDS)',
        phase: 'Wait Reduction',
        color: 'purple',
        icon: <Zap className="w-5 h-5" />,
        items: [
            'Signal-Aware Dispatch Offsets',
            'Rider idle-time prevention (SDS)',
            'CO₂ footprint reduction targeting',
        ],
    },
];

const SQS_TIERS = [
    { tier: 'Gold', range: '≥ 85%', desc: 'Reliable. Priority listing.', icon: '🥇', bg: 'bg-yellow-400/10', text: 'text-yellow-400', border: 'border-yellow-400/30' },
    { tier: 'Silver', range: '70–84%', desc: '+10% Buffer. Standard.', icon: '🥈', bg: 'bg-slate-400/10', text: 'text-slate-400', border: 'border-slate-400/30' },
    { tier: 'Bronze', range: '55–69%', desc: '+25% Buffer. Visibility reduced.', icon: '🥉', bg: 'bg-orange-400/10', text: 'text-orange-400', border: 'border-orange-400/30' },
    { tier: 'Blocked', range: '< 55%', desc: '+40% Buffer. Audited.', icon: '⛔', bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/30' },
];

export default function ArchitectureTab() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div className="max-w-2xl">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        System Architecture
                    </h1>
                    <p className="text-accentText text-lg font-medium leading-relaxed">
                        TrueSignal processes billions of data points through our enriched signal pipeline
                        to produce the industry's most accurate KPT predictions.
                    </p>
                </div>
                <div className="hidden lg:flex items-center gap-4 bg-panelBG/50 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4">
                    <div className="text-center">
                        <p className="text-[10px] uppercase tracking-widest text-accentText mb-1">Inference Latency</p>
                        <p className="text-xl font-mono font-bold text-green-400">&lt;100ms</p>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="text-center">
                        <p className="text-[10px] uppercase tracking-widest text-accentText mb-1">Signal Reliability</p>
                        <p className="text-xl font-mono font-bold text-blue-400">99.9%</p>
                    </div>
                </div>
            </div>

            {/* Signal Pipeline - Visual Flow */}
            <div className="bg-panelBG/30 border border-white/5 rounded-3xl p-10 mb-12 relative overflow-hidden glass">
                <div className="absolute inset-0 bg-gradient-to-tr from-zomato/5 via-transparent to-blue-500/5 pointer-events-none" />

                <h3 className="text-sm font-bold mb-10 text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Live Signal Pipeline
                </h3>

                <div className="relative flex items-center justify-between gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {PIPELINE_NODES.map((node, i) => (
                        <React.Fragment key={node.label}>
                            <div className="flex flex-col items-center group relative z-10 min-w-[140px]">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2 bg-panelBG border-2 border-panelBorder/50 shadow-2xl relative overflow-hidden`}>
                                    <div className={`absolute inset-0 bg-${node.color}-500 opacity-5 group-hover:opacity-10 transition-opacity`} />
                                    <span className="relative z-10 drop-shadow-lg">{node.icon}</span>
                                </div>
                                <p className="font-bold text-sm text-white group-hover:text-zomato transition-colors">{node.label}</p>
                                <p className="text-[10px] text-accentText mt-1 text-center font-medium opacity-70">{node.sub}</p>
                            </div>

                            {i < PIPELINE_NODES.length - 1 && (
                                <div className="flex-1 min-w-[40px] h-px relative flex items-center justify-center">
                                    <div className="w-full h-[1px] bg-white/10" />
                                    <div className="absolute w-3 h-3 rounded-full bg-panelBG border border-white/20 flex items-center justify-center">
                                        <ArrowRight className="w-2 h-2 text-white/40" />
                                    </div>
                                    <div className="absolute w-full h-full overflow-hidden pointer-events-none">
                                        <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-zomato/30 to-transparent animate-flow-line bg-flow-line" />
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                    <div className="flex-1 min-w-[40px] h-px relative flex items-center justify-center">
                        <div className="w-full h-[1px] bg-white/10 border-dashed border-t" />
                        <ArrowRight className="w-4 h-4 text-emerald-500 animate-pulse" />
                    </div>
                    <div className="flex flex-col items-center group relative z-10 min-w-[140px]">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-3xl mb-4 animate-pulse">
                            <Zap className="w-8 h-8 text-emerald-400" />
                        </div>
                        <p className="font-bold text-sm text-emerald-400">ETA Success</p>
                    </div>
                </div>
            </div>

            {/* Signal Layers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {SIGNAL_LAYERS.map(({ title, phase, color, icon, items }) => (
                    <div key={title} className="group glass border border-white/5 rounded-3xl p-6 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`p-3 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 group-hover:scale-110 transition-transform duration-500`}>
                                {icon}
                            </div>
                            <span className="text-[10px] font-bold tracking-[0.1em] text-white/30 uppercase">{phase}</span>
                        </div>
                        <h4 className="text-lg font-bold mb-4">{title}</h4>
                        <ul className="space-y-4">
                            {items.map(item => (
                                <li key={item} className="text-xs text-accentText flex gap-3 leading-relaxed group-hover:text-white/80 transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-zomato/40 mt-1 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* SQS Tiers Table */}
            <div className="bg-panelBG/50 border border-white/5 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Award className="w-32 h-32" />
                </div>
                <h3 className="text-sm font-bold mb-8 text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-400" /> Merchant Trust Program
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {SQS_TIERS.map((tier) => (
                        <div key={tier.tier} className={`group ${tier.bg} ${tier.border} border rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]`}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl">{tier.icon}</span>
                                <span className={`text-sm font-black font-mono ${tier.text}`}>{tier.range}</span>
                            </div>
                            <h4 className="font-bold text-white mb-2">{tier.tier}</h4>
                            <p className="text-xs text-accentText leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                {tier.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
