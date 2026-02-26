import { Activity, BarChart2, Layers, RotateCcw, ShieldCheck } from 'lucide-react';

const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'simulation', label: 'Live Sim', icon: Activity },
    { id: 'architecture', label: 'Architecture', icon: Layers },
];

export default function Navbar({ activeTab, setActiveTab, backendOnline, onReset }) {
    return (
        <header className="border-b border-panelBorder bg-panelBG sticky top-0 z-50 shadow-lg">
            {/* Top bar */}
            <div className="max-w-[1600px] mx-auto px-8 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-zomato flex items-center justify-center shadow-lg shadow-zomato/30">
                        <ShieldCheck className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-xl tracking-tight">
                        TrueSignal <span className="text-accentText font-normal">KPT Engine</span>
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Backend status pill */}
                    <span
                        className={`px-3 py-1 text-xs font-medium rounded-full flex items-center border gap-1.5
              ${backendOnline === true
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : backendOnline === false
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                    : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}
                    >
                        <span
                            className={`w-2 h-2 rounded-full ${backendOnline === true
                                ? 'bg-green-500 animate-pulse'
                                : backendOnline === false
                                    ? 'bg-red-500'
                                    : 'bg-zinc-500'
                                }`}
                        />
                        {backendOnline === true
                            ? 'API Online'
                            : backendOnline === false
                                ? 'API Offline'
                                : 'Checking…'}
                    </span>

                    <button
                        onClick={onReset}
                        title="Reset demo state"
                        className="p-2 rounded-lg border border-panelBorder hover:border-red-500/40 hover:text-red-400 text-accentText transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Tab bar */}
            <div className="max-w-[1600px] mx-auto px-8 flex gap-1 -mb-px">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors
              ${activeTab === id
                                ? 'border-zomato text-white'
                                : 'border-transparent text-accentText hover:text-white hover:border-panelBorder'}`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>
        </header>
    );
}
