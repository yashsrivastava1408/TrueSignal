import { Utensils, ShieldAlert, Clock, Zap } from 'lucide-react';

export function getRicBand(ric) {
    if (ric < 0.15) return { label: 'Reliable', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    if (ric < 0.40) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
    if (ric < 0.70) return { label: 'High Risk', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    return { label: 'Gaming', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
}

export function getSqsTier(sqs) {
    if (sqs >= 85) return { tier: 'Gold', color: 'text-yellow-300', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', icon: '🥇' };
    if (sqs >= 70) return { tier: 'Silver', color: 'text-slate-300', bg: 'bg-slate-400/10', border: 'border-slate-400/30', icon: '🥈' };
    if (sqs >= 55) return { tier: 'Bronze', color: 'text-orange-300', bg: 'bg-orange-400/10', border: 'border-orange-400/30', icon: '🥉' };
    return { tier: 'Below Threshold', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: '⛔' };
}

export default function MerchantProfile({
    name, type, ric, sqs, baseKpt, adjKpt, adjustment, isGaming, hiddenLoad, reservations, reason, dispatchDelay
}) {
    const ricBand = getRicBand(ric);
    const sqsTier = getSqsTier(sqs);

    return (
        <div
            className={`bg-panelBG border ${isGaming ? 'border-red-500/20' : 'border-green-500/20'
                } rounded-xl p-5 relative overflow-hidden`}
        >
            {/* Gaming accent corner */}
            {isGaming && (
                <div className="absolute top-0 right-0 w-14 h-14 bg-red-500/10 rounded-bl-full border-l border-b border-red-500/20" />
            )}

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${isGaming ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                        }`}
                >
                    <Utensils className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-semibold text-sm">{name}</h3>
                    <p className="text-xs text-accentText">{type}</p>
                </div>
            </div>

            {/* RIC bar */}
            <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-accentText">Rider Trigger Rate</span>
                    <span className={`font-bold ${ricBand.color}`}>
                        {ric.toFixed(3)} · {ricBand.label}
                    </span>
                </div>
                <div className="w-full bg-darkBG rounded-full h-1.5">
                    <div
                        className={`h-1.5 rounded-full transition-all duration-700 ${isGaming ? 'bg-red-500' : 'bg-green-500'
                            }`}
                        style={{ width: `${Math.min(ric * 100, 100)}%` }}
                    />
                </div>
            </div>

            {/* Phase 2: Kitchen Load Meter */}
            <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-accentText">Kitchen Load (Dineout + Walk-in)</span>
                    <span className={`font-bold ${hiddenLoad > 0.7 ? 'text-orange-400' : 'text-blue-400'}`}>
                        {Math.round(hiddenLoad * 100)}% {reservations > 0 ? `· ${reservations} Res` : ''}
                    </span>
                </div>
                <div className="w-full bg-darkBG rounded-full h-1.5">
                    <div
                        className={`h-1.5 rounded-full transition-all duration-700 ${hiddenLoad > 0.7 ? 'bg-orange-500' : 'bg-blue-500'
                            }`}
                        style={{ width: `${Math.min(hiddenLoad * 100, 100)}%` }}
                    />
                </div>
            </div>

            {/* SQS tier badge */}
            <div
                className={`flex items-center justify-between rounded-lg px-3 py-2 border mb-4 ${sqsTier.bg} ${sqsTier.border}`}
            >
                <span className="text-xs text-accentText">Accuracy Tier</span>
                <span className={`text-xs font-bold ${sqsTier.color}`}>
                    {sqsTier.icon} {sqsTier.tier} — {sqs}%
                </span>
            </div>

            {/* KPT comparison */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-darkBG rounded-lg p-3 text-center border border-panelBorder">
                    <p className="text-xs text-accentText mb-1">Original Estimate</p>
                    <p className="font-semibold text-sm">{baseKpt}m</p>
                </div>
                <div
                    className={`rounded-lg p-3 text-center border ${isGaming
                        ? 'bg-red-500/5 border-red-500/20 text-red-300'
                        : 'bg-green-500/5 border-green-500/20 text-green-300'
                        }`}
                >
                    <p className="text-xs opacity-80 mb-1">Corrected ETA</p>
                    <p className="font-bold text-sm">{adjKpt.toFixed(1)}m</p>
                </div>
            </div>

            {/* Phase 3: Dispatch Offset (SDS) */}
            {dispatchDelay > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">SDS Dispatch Offset</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-300">Wait {dispatchDelay.toFixed(1)}m</span>
                </div>
            )}

            {/* Dynamic Adjustment Reason */}
            {adjustment > 0 && reason && (
                <div className={`mt-3 text-xs px-3 py-2 rounded flex items-center gap-1.5 ${reason?.includes('Poor') || reason?.includes('Unreliable')
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}>
                    {reason?.includes('Hidden') ? <Clock className="w-3 h-3 flex-shrink-0" /> : <ShieldAlert className="w-3 h-3 flex-shrink-0" />}
                    {reason} (+{Number(adjustment || 0).toFixed(1)}m)
                </div>
            )}
        </div>
    );
}
