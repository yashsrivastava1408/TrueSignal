import { Activity, CheckCircle, ShieldAlert, Database, Play, Square, RefreshCw, GitBranch, ChevronRight } from 'lucide-react';

export default function SimulationTab({
    logs, simRunning, seeding, backendOnline,
    onStartSim, onStopSim, onSeedHistory, onReset, onSimulateLoad,
}) {
    return (
        <>
            {/* Page header */}
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Live Simulation</h1>
                    <p className="text-accentText max-w-xl text-sm">
                        Seed historical data, run live predictions, and watch RIC + SQS update in real-time.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onSeedHistory}
                        disabled={seeding || !backendOnline}
                        className="px-4 py-2 border border-panelBorder hover:border-blue-500/50 text-sm font-medium rounded-lg text-accentText hover:text-white transition-all flex items-center gap-2 disabled:opacity-40"
                    >
                        {seeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                        {seeding ? 'Seeding…' : 'Seed History'}
                    </button>

                    {simRunning ? (
                        <button
                            onClick={onStopSim}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 transition-all text-white font-medium rounded-lg flex items-center gap-2"
                        >
                            <Square className="w-4 h-4" /> Stop
                        </button>
                    ) : (
                        <button
                            onClick={onStartSim}
                            disabled={!backendOnline}
                            className="px-4 py-2 bg-zomato hover:bg-zomato-hover text-white font-medium rounded-lg flex items-center gap-2 disabled:opacity-40"
                        >
                            <Play className="w-4 h-4" /> Start
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Step-by-step walkthrough */}
                <div className="bg-panelBG border border-panelBorder rounded-xl p-6 shadow-xl">
                    <h3 className="text-base font-semibold mb-5 flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-blue-400" /> Demo Walkthrough
                    </h3>
                    <ol className="space-y-5">
                        {[
                            {
                                n: '01',
                                title: 'Seed Historical Data',
                                body: 'Inject 30 simulated FOR events per merchant. Spice Garden will have ~85% rider-influenced marks; Reliable Rest only ~10%.',
                                action: onSeedHistory,
                                label: seeding ? 'Seeding…' : 'Seed Now',
                                disabled: seeding || !backendOnline,
                            },
                            {
                                n: '02',
                                title: 'Start Live Predictions',
                                body: 'Auto-fire /predict_kpt every 2.5s for both merchants. Watch adjusted ETAs and SQS tier update in real-time.',
                                action: onStartSim,
                                label: simRunning ? 'Running…' : 'Start Sim',
                                disabled: simRunning || !backendOnline,
                            },
                            {
                                n: '03',
                                title: 'Observe the Divergence',
                                body: "Spice Garden's RIC rises to ~0.75–0.85 → 40% KPT buffer is applied. Reliable Rest stays at ~0.10 → no correction needed.",
                                action: null,
                                label: null,
                                disabled: false,
                            },
                            {
                                n: '04',
                                title: 'Phase 2: Simulate Peak Rush',
                                body: 'Simulate high dine-in traffic via Dineout reservoirs. Watch KPT increase independently of signal quality.',
                                action: () => onSimulateLoad('reliable_rest', 0.85, 12),
                                label: 'Simulate Rush',
                                disabled: !backendOnline,
                            },
                            {
                                n: '05',
                                title: 'Reset & Repeat',
                                body: 'Click the ↺ button in the top-right to clear all Feature Store data and start fresh.',
                                action: onReset,
                                label: 'Reset',
                                disabled: false,
                            },
                        ].map(({ n, title, body, action, label, disabled }) => (
                            <li key={n} className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-zomato/10 border border-zomato/30 text-zomato text-xs font-bold flex items-center justify-center">
                                    {n}
                                </span>
                                <div className="flex-1">
                                    <p className="font-medium text-sm mb-1">{title}</p>
                                    <p className="text-xs text-accentText leading-relaxed">{body}</p>
                                    {action && (
                                        <button
                                            onClick={action}
                                            disabled={disabled}
                                            className="mt-2 px-3 py-1 text-xs bg-panelBorder hover:bg-zinc-700 rounded font-medium transition-colors disabled:opacity-40 flex items-center gap-1"
                                        >
                                            <ChevronRight className="w-3 h-3" /> {label}
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* Event log */}
                <div className="bg-panelBG border border-panelBorder rounded-xl p-6 shadow-xl flex flex-col">
                    <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
                        <Activity className="w-4 h-4 text-accentText" /> Prediction Event Log
                        <span className="ml-auto text-xs text-accentText">{logs.length} events</span>
                    </h3>
                    <div
                        id="event-log"
                        className="bg-darkBG border border-panelBorder rounded-lg p-4 flex-1 overflow-y-auto font-mono text-xs space-y-1.5 min-h-[420px]"
                    >
                        {logs.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-accentText italic">
                                Waiting for events…
                            </div>
                        ) : (
                            logs.map((log, i) => (
                                <div
                                    key={i}
                                    className={`leading-relaxed border-b border-panelBorder/40 pb-1 last:border-0 ${log.includes('Spice Garden')
                                        ? 'text-amber-400'
                                        : log.includes('Reliable')
                                            ? 'text-green-400'
                                            : 'text-accentText'
                                        }`}
                                >
                                    {log.includes('Spice Garden') && <ShieldAlert className="inline w-3 h-3 mr-1 mb-0.5" />}
                                    {log.includes('Reliable') && <CheckCircle className="inline w-3 h-3 mr-1 mb-0.5" />}
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
