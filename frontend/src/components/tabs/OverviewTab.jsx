import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
    AreaChart, Area,
} from 'recharts';
import { Clock, TrendingUp, AlertTriangle, Zap, Award, Signal, Database, Play, Square, RefreshCw, ShieldCheck, Coins, ChevronRight, Leaf, Search, Target, MapPin, History } from 'lucide-react';
import { useState } from 'react';
import KpiCard from '../KpiCard';
import MerchantProfile from '../MerchantProfile';

export default function OverviewTab({
    stats, historyData, totalOrders, totalEtaSaved, riderHoursSaved, fuelSavedMl, orderHistory,
    simRunning, seeding, backendOnline,
    onStartSim, onStopSim, onSeedHistory, onSimulateLoad,
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [inspectedOrder, setInspectedOrder] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState('Bangalore - Sector 7 (HSR)');

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (val.length > 2) {
            const found = orderHistory.find(o => o?.order_id?.toString()?.includes(val));
            setInspectedOrder(found || null);
        } else {
            setInspectedOrder(null);
        }
    };
    const chartData = historyData.length
        ? historyData
        : [{ time: '—', ReliableRIC: 0, SpiceGardenRIC: 0, ReliableSQS: 100, SpiceGardenSQS: 100 }];

    return (
        <>
            {/* Page header */}
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Signal Insights</h1>
                    <p className="text-accentText max-w-xl text-sm">
                        See which restaurants are gaming their 'food ready' signal — and how TrueSignal corrects delivery time estimates automatically.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onSeedHistory}
                        disabled={seeding || !backendOnline}
                        className="px-4 py-2 border border-panelBorder hover:border-blue-500/50 text-sm font-medium rounded-lg text-accentText hover:text-white transition-all flex items-center gap-2 disabled:opacity-40"
                    >
                        {seeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                        {seeding ? 'Seeding…' : 'Seed 30-Day History'}
                    </button>

                    {simRunning ? (
                        <button
                            onClick={onStopSim}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 transition-all text-white font-medium rounded-lg flex items-center gap-2 shadow-lg shadow-red-600/20"
                        >
                            <Square className="w-4 h-4" /> Stop Sim
                        </button>
                    ) : (
                        <button
                            onClick={onStartSim}
                            disabled={!backendOnline}
                            className="px-4 py-2 bg-zomato hover:bg-zomato-hover transition-all text-white font-medium rounded-lg flex items-center gap-2 shadow-lg shadow-zomato/20 disabled:opacity-40"
                        >
                            <Play className="w-4 h-4" /> Start Live Sim
                        </button>
                    )}
                </div>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="glass-card card-hover-effect rounded-2xl p-5 relative overflow-hidden">
                    <KpiCard
                        title="Rider Wait Saved"
                        value={`${riderHoursSaved} hrs`}
                        secondary="Total idle time prevented today"
                        icon={<Clock className="w-5 h-5 text-blue-400" />}
                        color="border-none"
                    />
                </div>
                <div className="glass-card card-hover-effect rounded-2xl p-5 relative overflow-hidden">
                    <KpiCard
                        title="Fuel Saved (CO₂ Win)"
                        value={`${(fuelSavedMl / 1000).toFixed(2)} L`}
                        secondary="Fuel saved via idle reduction"
                        icon={<Leaf className="w-5 h-5 text-emerald-400" />}
                        color="border-none"
                    />
                </div>
                <div className="glass-card card-hover-effect rounded-2xl p-5 relative overflow-hidden">
                    <KpiCard
                        title="Orders Simulated"
                        value={totalOrders.toString()}
                        secondary="Predictions corrected in real-time"
                        icon={<TrendingUp className="w-5 h-5 text-amber-400" />}
                        color="border-none"
                    />
                </div>
                <div className="glass-card card-hover-effect rounded-2xl p-5 relative overflow-hidden">
                    <KpiCard
                        title="Cluster Accuracy"
                        value={`${stats.reliable.sqs}%`}
                        secondary={`Avg. for ${selectedRegion.split(' ')[0]}`}
                        icon={<Award className="w-5 h-5 text-purple-400" />}
                        color="border-none"
                    />
                </div>
            </div>

            {/* Control Tower Search & Region Selector */}
            <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative group flex-1 w-full max-w-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-accentText group-focus-within:text-zomato transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Forensic Search: Paste Order ID..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="block w-full pl-10 pr-3 py-2.5 bg-panelBG border border-panelBorder rounded-xl leading-5 text-white placeholder-accentText focus:outline-none focus:ring-2 focus:ring-zomato/30 focus:border-zomato transition-all text-sm"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto whitespace-nowrap bg-panelBG border border-panelBorder rounded-xl p-1.5">
                    {['Bangalore - Sector 7 (HSR)', 'Indiranagar Cluster', 'Gurgaon Sector 45', 'Mumbai West'].map(region => (
                        <button
                            key={region}
                            onClick={() => setSelectedRegion(region)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedRegion === region
                                ? 'bg-zomato text-white shadow-lg shadow-zomato/20'
                                : 'text-accentText hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {region}
                        </button>
                    ))}
                </div>
            </div>

            {inspectedOrder && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-panelBG border border-zomato/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Target className="w-32 h-32 text-zomato" />
                        </div>

                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-4 text-zomato font-bold uppercase tracking-tighter text-xs">
                                    <div className="w-2 h-2 rounded-full bg-zomato animate-pulse" />
                                    Forensic Analysis: Order #{inspectedOrder.order_id}
                                </div>
                                <h4 className="text-xl font-bold mb-2">Signal Anomaly Detected</h4>
                                <p className="text-sm text-accentText mb-6 max-w-md">
                                    Root cause identification for KPT deviation based on real-time geofencing and behavioral signals.
                                </p>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="p-3 bg-darkBG rounded-xl border border-white/5">
                                        <p className="text-[10px] text-accentText uppercase font-bold mb-1">Bias Signal</p>
                                        <p className={`text-lg font-mono font-bold ${inspectedOrder.ric > 0.5 ? 'text-red-400' : 'text-green-400'}`}>
                                            RIC {inspectedOrder.ric.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-darkBG rounded-xl border border-white/5">
                                        <p className="text-[10px] text-accentText uppercase font-bold mb-1">Dispatch Wait</p>
                                        <p className="text-lg font-mono font-bold text-blue-400">
                                            {inspectedOrder.dispatch_delay_minutes}m
                                        </p>
                                    </div>
                                    <div className="p-3 bg-darkBG rounded-xl border border-white/5">
                                        <p className="text-[10px] text-accentText uppercase font-bold mb-1">Adjusted ETA</p>
                                        <p className="text-lg font-mono font-bold text-emerald-400">
                                            {inspectedOrder.adjusted_kpt}m
                                        </p>
                                    </div>
                                    <div className="p-3 bg-darkBG rounded-xl border border-white/5">
                                        <p className="text-[10px] text-accentText uppercase font-bold mb-1">Accuracy SQS</p>
                                        <p className="text-lg font-mono font-bold text-purple-400">
                                            {inspectedOrder.sqs.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:w-64 flex flex-col justify-center border-l border-white/5 pl-6 gap-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-red-400 mt-1" />
                                    <div>
                                        <p className="text-xs font-bold">Rider Proximity</p>
                                        <p className="text-[10px] text-accentText leading-relaxed">
                                            {inspectedOrder.ric > 0.5 ? 'Rider was within 150m at FOR mark. Signal biased.' : 'Rider was distant. Signal trustworthy.'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <History className="w-4 h-4 text-blue-400 mt-1" />
                                    <div>
                                        <p className="text-xs font-bold">Correction Logic</p>
                                        <p className="text-[10px] text-accentText leading-relaxed">
                                            {inspectedOrder.adjustment_reason}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Charts column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* RIC drift chart */}
                    <div className="glass-card card-hover-effect rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-zomato/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-base font-semibold flex items-center gap-2">
                                    <div className="pulse-dot" />
                                    <Signal className="w-4 h-4 text-zomato" /> Live Signal Drift
                                </h3>
                                <p className="text-xs text-accentText mt-0.5">
                                    How often each restaurant marks food ready only after the rider shows up (higher = worse)
                                </p>
                            </div>
                            <span className="text-xs text-accentText">{historyData.length} samples</span>
                        </div>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
                                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#292930" vertical={false} />
                                    <XAxis dataKey="time" stroke="#A1A1AA" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                    <YAxis stroke="#A1A1AA" fontSize={11} domain={[0, 1]} tickLine={false} axisLine={false} tickFormatter={v => v.toFixed(1)} width={28} />
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#16161A', borderColor: '#292930', color: '#fff', borderRadius: '8px', fontSize: '12px' }} />
                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                                    <Line type="monotone" name="Reliable Rest (honest)" dataKey="ReliableRIC" stroke="#22C55E" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} animationDuration={200} />
                                    <Line type="monotone" name="Spice Garden (gaming)" dataKey="SpiceGardenRIC" stroke="#E23744" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} animationDuration={200} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* SQS area chart */}
                    <div className="bg-panelBG border border-panelBorder rounded-xl p-6 shadow-xl">
                        <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
                            <Award className="w-4 h-4 text-purple-400" /> Signal Accuracy Score Over Time
                        </h3>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
                                <AreaChart data={chartData.slice(-40)} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="sqsGreen" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="sqsRed" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#E23744" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#E23744" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#292930" vertical={false} />
                                    <XAxis dataKey="time" stroke="#A1A1AA" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                    <YAxis stroke="#A1A1AA" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} width={28} />
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#16161A', borderColor: '#292930', color: '#fff', borderRadius: '8px', fontSize: '12px' }} />
                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                                    <Area type="monotone" name="Reliable Rest (accurate)" dataKey="ReliableSQS" stroke="#22C55E" fill="url(#sqsGreen)" strokeWidth={2} animationDuration={200} />
                                    <Area type="monotone" name="Spice Garden (unreliable)" dataKey="SpiceGardenSQS" stroke="#E23744" fill="url(#sqsRed)" strokeWidth={2} animationDuration={200} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Merchant cards */}
                <div className="space-y-5">
                    <MerchantProfile
                        name="Spice Garden"
                        type="⚠ Gaming the System"
                        ric={stats.spiceGarden.ric}
                        sqs={stats.spiceGarden.sqs}
                        baseKpt={14}
                        adjKpt={stats.spiceGarden.kptAvg}
                        adjustment={stats.spiceGarden.adjustment}
                        isGaming={true}
                        hiddenLoad={stats.spiceGarden.hiddenLoad}
                        reservations={stats.spiceGarden.reservations}
                        reason={stats.spiceGarden.reason}
                        dispatchDelay={stats.spiceGarden.dispatchDelay}
                    />
                    <MerchantProfile
                        name="Reliable Restaurant"
                        type="✓ Trustworthy Signals"
                        ric={stats.reliable.ric}
                        sqs={stats.reliable.sqs}
                        baseKpt={14}
                        adjKpt={stats.reliable.kptAvg}
                        adjustment={stats.reliable.adjustment}
                        isGaming={false}
                        hiddenLoad={stats.reliable.hiddenLoad}
                        reservations={stats.reliable.reservations}
                        reason={stats.reliable.reason}
                        dispatchDelay={stats.reliable.dispatchDelay}
                    />
                </div>
            </div>

            {/* Merchant Incentive Policy Panel */}
            <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-5 h-5 text-zomato" />
                    <h3 className="text-xl font-bold">Signal Policy & Rewards</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Gold Tier Reward */}
                    <div className="bg-panelBG border border-yellow-500/20 rounded-xl p-5 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                            <Award className="w-12 h-12 text-yellow-500" />
                        </div>
                        <h4 className="text-yellow-400 font-bold flex items-center gap-2 mb-2">
                            <Coins className="w-4 h-4" /> 1% Commission Rebate
                        </h4>
                        <p className="text-xs text-accentText leading-relaxed">
                            "Gold" merchants with {'>'}85% accuracy receive a 1% platform fee rebate. Honesty is directly profitable.
                        </p>
                        <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-yellow-500 uppercase tracking-wider">
                            <ShieldCheck className="w-3.5 h-3.5" /> Signal Verified Badge Active
                        </div>
                    </div>

                    {/* Listing Boost */}
                    <div className="bg-panelBG border border-blue-500/20 rounded-xl p-5 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                            <TrendingUp className="w-12 h-12 text-blue-500" />
                        </div>
                        <h4 className="text-blue-400 font-bold flex items-center gap-2 mb-2">
                            Priority Listing Boost
                        </h4>
                        <p className="text-xs text-accentText leading-relaxed">
                            Accurate KPT signals improve sorting rank by 15%. Reliable stores get more orders because we trust their timing.
                        </p>
                        <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-blue-500 uppercase tracking-wider text-opacity-80">
                            Up to +22% CTR Increase
                        </div>
                    </div>

                    {/* Penalty/Padding */}
                    <div className="bg-panelBG border border-red-500/20 rounded-xl p-5 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                            <Clock className="w-12 h-12 text-red-500" />
                        </div>
                        <h4 className="text-red-400 font-bold flex items-center gap-2 mb-2">
                            KPT Padding Penalty
                        </h4>
                        <p className="text-xs text-accentText leading-relaxed">
                            "Bronze" and "Below" merchants suffer automatic +25% to +40% buffer padding. This lowers CTR but protects customer P50 ETA.
                        </p>
                        <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase tracking-wider text-opacity-80">
                            Visible "Signal Noise" Penalty
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
