import { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import OverviewTab from './components/tabs/OverviewTab';
import SimulationTab from './components/tabs/SimulationTab';
import ArchitectureTab from './components/tabs/ArchitectureTab';

const API_BASE = 'http://127.0.0.1:8000';

async function apiFetch(path, opts) {
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const DEFAULT_STATS = {
  reliable: { ric: 0, sqs: 100, tier: 'Gold', kptAvg: 14, adjustment: 0, avgLatency: 10, hiddenLoad: 0, reservations: 0, reason: '', dispatchDelay: 0 },
  spiceGarden: { ric: 0, sqs: 100, tier: 'Gold', kptAvg: 14, adjustment: 0, avgLatency: 10, hiddenLoad: 0, reservations: 0, reason: '', dispatchDelay: 0 },
};

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [backendOnline, setBackendOnline] = useState(null); // null = checking
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [historyData, setHistoryData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalEtaSaved, setTotalEtaSaved] = useState(0);
  const [riderHoursSaved, setRiderHoursSaved] = useState(0);
  const [fuelSavedMl, setFuelSavedMl] = useState(0);
  const [orderHistory, setOrderHistory] = useState([]);
  const [seeding, setSeeding] = useState(false);
  const [simRunning, setSimRunning] = useState(false);

  const simRef = useRef(null);

  // ── Helper: append to log ─────────────────────────────────────
  const addLog = useCallback((msg) => {
    const ts = new Date().toLocaleTimeString();
    setLogs(prev => [`[${ts}] ${msg}`, ...prev].slice(0, 80));
  }, []);

  // ── Poll RIC + Stats every 2s ─────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const [r1, r2, s1, s2] = await Promise.all([
        apiFetch('/merchant/reliable_rest/ric'),
        apiFetch('/merchant/spice_garden/ric'),
        apiFetch('/merchant/reliable_rest/stats'),
        apiFetch('/merchant/spice_garden/stats'),
      ]);

      setStats(prev => ({
        reliable: {
          ...prev.reliable,
          ric: r1.ric,
          sqs: s1.sqs ?? 100,
          tier: s1.tier ?? 'Gold',
          avgLatency: s1.avg_latency ?? 10,
          hiddenLoad: s1.hidden_load ?? 0,
          reservations: s1.dineout_reservations ?? 0,
        },
        spiceGarden: {
          ...prev.spiceGarden,
          ric: r2.ric,
          sqs: s2.sqs ?? 100,
          tier: s2.tier ?? 'Gold',
          avgLatency: s2.avg_latency ?? 10,
          hiddenLoad: s2.hidden_load ?? 0,
          reservations: s2.dineout_reservations ?? 0,
        },
      }));

      setHistoryData(h => [...h, {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        ReliableRIC: r1.ric,
        SpiceGardenRIC: r2.ric,
        ReliableSQS: s1.sqs ?? 100,
        SpiceGardenSQS: s2.sqs ?? 100,
        ReliableLoad: s1.hidden_load ?? 0,
        SpiceGardenLoad: s2.hidden_load ?? 0,
      }].slice(-100));

      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 2000);
    return () => clearInterval(id);
  }, [fetchStats]);

  // ── Seed 30 historical FOR events ────────────────────────────
  const seedHistory = useCallback(async () => {
    setSeeding(true);
    addLog('Seeding 30 historical FOR events per merchant…');
    const merchants = {
      reliable_rest: { lat: 12.9716, lon: 77.5946, gamingProb: 0.10 },
      spice_garden: { lat: 12.9718, lon: 77.5948, gamingProb: 0.85 },
    };
    for (let i = 0; i < 100; i++) {
      for (const [id, m] of Object.entries(merchants)) {
        const gaming = Math.random() < m.gamingProb;
        const riderLat = gaming ? m.lat + (Math.random() * 0.002 - 0.001) : m.lat + (Math.random() * 0.04 + 0.01);
        const riderLon = gaming ? m.lon + (Math.random() * 0.002 - 0.001) : m.lon + (Math.random() * 0.04 + 0.01);
        await apiFetch('/mark_ready', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: `SEED-${id}-${i}`,
            merchant_id: id,
            merchant_loc: { lat: m.lat, lon: m.lon },
            rider_loc: { lat: riderLat, lon: riderLon },
          }),
        }).catch(() => { });
      }
      await new Promise(r => setTimeout(r, 5));
    }
    addLog('✓ History seeded. RIC scores now reflect 100 days of data.');
    setSeeding(false);
    fetchStats();
  }, [addLog, fetchStats]);

  // ── Single KPT prediction ─────────────────────────────────────
  const triggerPrediction = useCallback(async (merchantId) => {
    try {
      const data = await apiFetch('/predict_kpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: `DEMO-${Date.now()}`,
          merchant_id: merchantId,
          base_kpt_minutes: 14,
        }),
      });

      const name = merchantId === 'reliable_rest' ? 'Reliable Rest' : 'Spice Garden';
      addLog(`${name} → Base: ${data.base_kpt}m | Adj: ${data.adjusted_kpt.toFixed(1)}m | SQS: ${data.sqs} | ${data.adjustment_reason}`);

      const key = merchantId === 'reliable_rest' ? 'reliable' : 'spiceGarden';
      setStats(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          kptAvg: data.adjusted_kpt,
          adjustment: data.eta_saved_minutes,
          reason: data.adjustment_reason,
          dispatchDelay: data.dispatch_delay_minutes
        },
      }));
      setOrderHistory(prev => [data, ...prev].slice(0, 50));
      setTotalOrders(n => n + 1);
      setTotalEtaSaved(n => parseFloat((n + data.eta_saved_minutes).toFixed(1)));
      setRiderHoursSaved(n => parseFloat((n + (data.eta_saved_minutes / 60)).toFixed(2)));
      setFuelSavedMl(n => n + data.fuel_saved_ml);
    } catch (err) {
      addLog(`✖ Connection Error: Could not reach backend for ${merchantId}.`);
      console.error(err);
    }
  }, [addLog]);

  // ── Simulator start / stop ────────────────────────────────────
  const startSimulator = useCallback(() => {
    if (simRef.current) return;
    setSimRunning(true);
    addLog('▶ Live simulator started.');
    simRef.current = setInterval(async () => {
      await triggerPrediction('reliable_rest');
      await triggerPrediction('spice_garden');
    }, 1000);
  }, [addLog, triggerPrediction]);

  const stopSimulator = useCallback(() => {
    if (simRef.current) { clearInterval(simRef.current); simRef.current = null; }
    setSimRunning(false);
    addLog('⏹ Simulator stopped.');
  }, [addLog]);

  // ── Full reset ────────────────────────────────────────────────
  // ── Phase 2: Simulate Kitchen Load ───────────────────────────
  const simulateKitchenLoad = useCallback(async (merchantId, load, resCount) => {
    await apiFetch(`/simulate_dinein?merchant_id=${merchantId}&load=${load}&reservations=${resCount}`, {
      method: 'POST'
    });
    addLog(`Phase 2: Updated Kitchen Load for ${merchantId === 'reliable_rest' ? 'Reliable' : 'Spice Garden'} to ${Math.round(load * 100)}% (${resCount} Dineout reservations)`);
    fetchStats();
  }, [addLog, fetchStats]);

  const resetAll = useCallback(async () => {
    stopSimulator();
    await apiFetch('/reset', { method: 'POST' }).catch(() => { });
    setLogs([]);
    setHistoryData([]);
    setTotalOrders(0);
    setTotalEtaSaved(0);
    setStats(DEFAULT_STATS);
    fetchStats();
  }, [stopSimulator, fetchStats]);

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-darkBG text-white font-sans selection:bg-zomato selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendOnline={backendOnline}
        onReset={resetAll}
      />

      <main className="max-w-[1600px] mx-auto px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewTab
            stats={stats}
            historyData={historyData}
            totalOrders={totalOrders}
            totalEtaSaved={totalEtaSaved}
            riderHoursSaved={riderHoursSaved}
            fuelSavedMl={fuelSavedMl}
            orderHistory={orderHistory}
            simRunning={simRunning}
            seeding={seeding}
            backendOnline={backendOnline}
            onStartSim={startSimulator}
            onStopSim={stopSimulator}
            onSeedHistory={seedHistory}
            onSimulateLoad={simulateKitchenLoad}
          />
        )}

        {activeTab === 'simulation' && (
          <SimulationTab
            logs={logs}
            simRunning={simRunning}
            seeding={seeding}
            backendOnline={backendOnline}
            onStartSim={startSimulator}
            onStopSim={stopSimulator}
            onSeedHistory={seedHistory}
            onReset={resetAll}
            onSimulateLoad={simulateKitchenLoad}
          />
        )}

        {activeTab === 'architecture' && <ArchitectureTab />}
      </main>
    </div>
  );
}
