import { useState, useEffect, useRef } from "react";
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────
const STOCKS = [
  { symbol: "RELIANCE", name: "Reliance Industries", qty: 12, avgPrice: 2410, cmp: 2874, sector: "Energy" },
  { symbol: "INFY", name: "Infosys Ltd.", qty: 25, avgPrice: 1380, cmp: 1521, sector: "IT" },
  { symbol: "HDFCBANK", name: "HDFC Bank", qty: 18, avgPrice: 1590, cmp: 1482, sector: "Banking" },
  { symbol: "TCS", name: "Tata Consultancy", qty: 8, avgPrice: 3640, cmp: 3912, sector: "IT" },
  { symbol: "ICICIBANK", name: "ICICI Bank", qty: 30, avgPrice: 940, cmp: 1087, sector: "Banking" },
];

const MF = [
  { name: "Mirae Asset Large Cap", invested: 50000, current: 68400, units: 1240, nav: 55.16 },
  { name: "Axis Bluechip Fund", invested: 36000, current: 44100, units: 890, nav: 49.55 },
  { name: "Parag Parikh Flexi Cap", invested: 60000, current: 81200, units: 1580, nav: 51.39 },
];

const portfolioHistory = [
  { month: "Oct", value: 285000 },
  { month: "Nov", value: 301000 },
  { month: "Dec", value: 294000 },
  { month: "Jan", value: 318000 },
  { month: "Feb", value: 332000 },
  { month: "Mar", value: 358420 },
];

const sectorData = [
  { name: "IT", value: 38 },
  { name: "Banking", value: 29 },
  { name: "Energy", value: 18 },
  { name: "MF", value: 15 },
];

const SECTOR_COLORS = ["#00d4a0", "#3b82f6", "#f59e0b", "#a78bfa"];

const sipHistory = [
  { month: "Oct", invested: 10000, returns: 10420 },
  { month: "Nov", invested: 20000, returns: 21100 },
  { month: "Dec", invested: 30000, returns: 31800 },
  { month: "Jan", invested: 40000, returns: 43200 },
  { month: "Feb", invested: 50000, returns: 54600 },
  { month: "Mar", invested: 60000, returns: 66800 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
const fmtCr = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(2)}L` : `₹${fmt(n)}`;

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0f1923", border: "1px solid #1e3040", borderRadius: 8, padding: "8px 14px" }}>
      <p style={{ color: "#6b8a9e", fontSize: 11, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#00d4a0", fontSize: 12, fontWeight: 600 }}>
          ₹{fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

// ── Main App ──────────────────────────────────────────────────────────────────
export default function FinVue() {
  const [tab, setTab] = useState("overview");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const totalStockInvested = STOCKS.reduce((s, x) => s + x.qty * x.avgPrice, 0);
  const totalStockCurrent  = STOCKS.reduce((s, x) => s + x.qty * x.cmp, 0);
  const totalMFInvested    = MF.reduce((s, x) => s + x.invested, 0);
  const totalMFCurrent     = MF.reduce((s, x) => s + x.current, 0);
  const totalInvested      = totalStockInvested + totalMFInvested;
  const totalCurrent       = totalStockCurrent + totalMFCurrent;
  const totalPnL           = totalCurrent - totalInvested;
  const totalPct           = ((totalPnL / totalInvested) * 100).toFixed(2);
  const dayChange          = 4820;

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: "#070d12",
      minHeight: "100vh",
      color: "#e2eaf0",
      padding: "0 0 40px 0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0f1923; }
        ::-webkit-scrollbar-thumb { background: #1e3040; border-radius: 4px; }
        .nav-tab { cursor: pointer; padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 500; transition: all 0.2s; border: none; background: transparent; color: #6b8a9e; }
        .nav-tab:hover { color: #e2eaf0; background: #0f1923; }
        .nav-tab.active { color: #00d4a0; background: rgba(0,212,160,0.1); }
        .card { background: #0d1c27; border: 1px solid #1a2d3d; border-radius: 14px; padding: 20px; transition: all 0.2s; }
        .card:hover { border-color: #243d52; }
        .stat-card { background: linear-gradient(135deg, #0d1c27 0%, #0a1820 100%); border: 1px solid #1a2d3d; border-radius: 14px; padding: 20px 22px; position: relative; overflow: hidden; }
        .stat-card::before { content: ''; position: absolute; top: -30px; right: -30px; width: 80px; height: 80px; border-radius: 50%; opacity: 0.06; }
        .stock-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 8px; padding: 12px 16px; border-radius: 10px; align-items: center; transition: background 0.15s; }
        .stock-row:hover { background: #0f1923; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; letter-spacing: 0.5px; }
        .fade-in { opacity: 0; transform: translateY(16px); animation: fadeUp 0.5s forwards; }
        @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
        .pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: #00d4a0; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        .mf-card { background: #0d1c27; border: 1px solid #1a2d3d; border-radius: 12px; padding: 16px 18px; margin-bottom: 10px; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 8px; align-items: center; transition: border-color 0.2s; }
        .mf-card:hover { border-color: #243d52; }
      `}</style>

      {/* Navbar */}
      <div style={{ background: "#070d12", borderBottom: "1px solid #111e28", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58, position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #00d4a0, #0099ff)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#070d12" }}>F</div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px" }}>Fin<span style={{ color: "#00d4a0" }}>Vue</span></span>
        </div>
        <nav style={{ display: "flex", gap: 4 }}>
          {["overview", "stocks", "mutual funds", "analytics"].map(t => (
            <button key={t} className={`nav-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="pulse-dot" />
          <span style={{ fontSize: 12, color: "#6b8a9e" }}>Live</span>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #1a3a52, #0f2535)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#00d4a0", marginLeft: 8, cursor: "pointer" }}>AG</div>
        </div>
      </div>

      <div style={{ padding: "28px 32px", maxWidth: 1140, margin: "0 auto" }}>

        {/* Overview Tab */}
        {tab === "overview" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <p style={{ color: "#6b8a9e", fontSize: 12, marginBottom: 4 }}>Good morning, Anushka 👋</p>
              <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px" }}>Portfolio Overview</h1>
            </div>

            {/* Top Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
              {[
                { label: "Total Value", value: fmtCr(totalCurrent), sub: `Invested ${fmtCr(totalInvested)}`, color: "#00d4a0", delay: 0 },
                { label: "Total P&L", value: `+${fmtCr(totalPnL)}`, sub: `+${totalPct}% returns`, color: "#00d4a0", delay: 80 },
                { label: "Today's Change", value: `+₹${fmt(dayChange)}`, sub: "+1.36% today", color: "#3b82f6", delay: 160 },
                { label: "Invested Capital", value: fmtCr(totalInvested), sub: "Across stocks & MFs", color: "#a78bfa", delay: 240 },
              ].map((s, i) => (
                <div key={i} className="stat-card fade-in" style={{ animationDelay: `${s.delay}ms` }}>
                  <p style={{ fontSize: 11, color: "#6b8a9e", fontWeight: 500, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.8px" }}>{s.label}</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: "'DM Mono', monospace", letterSpacing: "-0.5px" }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: "#3d5a6e", marginTop: 5 }}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 22 }}>
              <div className="card fade-in" style={{ animationDelay: "200ms" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div>
                    <p style={{ fontSize: 12, color: "#6b8a9e", marginBottom: 2 }}>Portfolio Growth</p>
                    <p style={{ fontSize: 16, fontWeight: 700 }}>₹3,58,420</p>
                  </div>
                  <span className="badge" style={{ background: "rgba(0,212,160,0.1)", color: "#00d4a0" }}>+25.6% 6M</span>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={portfolioHistory}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4a0" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#00d4a0" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fill: "#3d5a6e", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="#00d4a0" strokeWidth={2} fill="url(#g1)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="card fade-in" style={{ animationDelay: "280ms" }}>
                <p style={{ fontSize: 12, color: "#6b8a9e", marginBottom: 4 }}>Sector Allocation</p>
                <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Diversification</p>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={sectorData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                      {sectorData.map((_, i) => <Cell key={i} fill={SECTOR_COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "#0f1923", border: "1px solid #1e3040", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                  {sectorData.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 7, height: 7, borderRadius: 2, background: SECTOR_COLORS[i] }} />
                      <span style={{ fontSize: 11, color: "#6b8a9e" }}>{s.name} {s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Holdings */}
            <div className="card fade-in" style={{ animationDelay: "340ms" }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Top Holdings</p>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 8, padding: "0 16px 10px", borderBottom: "1px solid #111e28" }}>
                {["Stock", "Qty", "Avg Price", "LTP", "P&L"].map(h => (
                  <p key={h} style={{ fontSize: 10, color: "#3d5a6e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px" }}>{h}</p>
                ))}
              </div>
              {STOCKS.slice(0, 4).map((s, i) => {
                const pnl = (s.cmp - s.avgPrice) * s.qty;
                const pct = (((s.cmp - s.avgPrice) / s.avgPrice) * 100).toFixed(1);
                const pos = pnl >= 0;
                return (
                  <div key={i} className="stock-row">
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{s.symbol}</p>
                      <p style={{ fontSize: 10, color: "#3d5a6e" }}>{s.sector}</p>
                    </div>
                    <p style={{ fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{s.qty}</p>
                    <p style={{ fontSize: 12, fontFamily: "'DM Mono', monospace" }}>₹{fmt(s.avgPrice)}</p>
                    <p style={{ fontSize: 12, fontFamily: "'DM Mono', monospace" }}>₹{fmt(s.cmp)}</p>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: pos ? "#00d4a0" : "#f87171", fontFamily: "'DM Mono', monospace" }}>{pos ? "+" : ""}₹{fmt(Math.abs(pnl))}</p>
                      <p style={{ fontSize: 10, color: pos ? "#00a880" : "#dc2626" }}>{pos ? "▲" : "▼"} {Math.abs(pct)}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stocks Tab */}
        {tab === "stocks" && (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Stock Holdings</h2>
                <p style={{ fontSize: 12, color: "#6b8a9e", marginTop: 2 }}>Equity portfolio · {STOCKS.length} positions</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ background: "rgba(0,212,160,0.08)", border: "1px solid rgba(0,212,160,0.2)", borderRadius: 10, padding: "8px 16px" }}>
                  <p style={{ fontSize: 10, color: "#6b8a9e" }}>Invested</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#00d4a0", fontFamily: "'DM Mono', monospace" }}>{fmtCr(totalStockInvested)}</p>
                </div>
                <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: "8px 16px" }}>
                  <p style={{ fontSize: 10, color: "#6b8a9e" }}>Current</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#3b82f6", fontFamily: "'DM Mono', monospace" }}>{fmtCr(totalStockCurrent)}</p>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2.5fr 0.8fr 1fr 1fr 1.2fr 1.2fr", gap: 8, padding: "12px 20px", borderBottom: "1px solid #111e28" }}>
                {["Company", "Qty", "Avg Buy", "LTP", "Current Val", "P&L"].map(h => (
                  <p key={h} style={{ fontSize: 10, color: "#3d5a6e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px" }}>{h}</p>
                ))}
              </div>
              {STOCKS.map((s, i) => {
                const pnl = (s.cmp - s.avgPrice) * s.qty;
                const pct = (((s.cmp - s.avgPrice) / s.avgPrice) * 100).toFixed(2);
                const pos = pnl >= 0;
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "2.5fr 0.8fr 1fr 1fr 1.2fr 1.2fr", gap: 8, padding: "14px 20px", borderBottom: "1px solid #0d1820", alignItems: "center", transition: "background 0.15s", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#0d1820"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, #0f2535, #1a3a52)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#00d4a0" }}>{s.symbol.slice(0, 2)}</div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{s.symbol}</p>
                        <p style={{ fontSize: 10, color: "#3d5a6e" }}>{s.name}</p>
                      </div>
                    </div>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{s.qty}</p>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>₹{fmt(s.avgPrice)}</p>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>₹{fmt(s.cmp)}</p>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>₹{fmt(s.qty * s.cmp)}</p>
                    <div>
                      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 600, color: pos ? "#00d4a0" : "#f87171" }}>{pos ? "+" : "-"}₹{fmt(Math.abs(pnl))}</p>
                      <span className="badge" style={{ background: pos ? "rgba(0,212,160,0.1)" : "rgba(248,113,113,0.1)", color: pos ? "#00d4a0" : "#f87171", marginTop: 3 }}>{pos ? "▲" : "▼"} {Math.abs(pct)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mutual Funds Tab */}
        {tab === "mutual funds" && (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Mutual Funds</h2>
                <p style={{ fontSize: 12, color: "#6b8a9e", marginTop: 2 }}>{MF.length} active SIPs · Monthly investment ₹5,000</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 10, padding: "8px 16px" }}>
                  <p style={{ fontSize: 10, color: "#6b8a9e" }}>Total Invested</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#a78bfa", fontFamily: "'DM Mono', monospace" }}>{fmtCr(totalMFInvested)}</p>
                </div>
                <div style={{ background: "rgba(0,212,160,0.08)", border: "1px solid rgba(0,212,160,0.2)", borderRadius: 10, padding: "8px 16px" }}>
                  <p style={{ fontSize: 10, color: "#6b8a9e" }}>Current Value</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#00d4a0", fontFamily: "'DM Mono', monospace" }}>{fmtCr(totalMFCurrent)}</p>
                </div>
              </div>
            </div>

            {/* SIP Growth Chart */}
            <div className="card" style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "#6b8a9e", marginBottom: 4 }}>SIP Investment vs Returns</p>
              <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Cumulative Growth</p>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={sipHistory}>
                  <defs>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4a0" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#00d4a0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: "#3d5a6e", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="invested" stroke="#a78bfa" strokeWidth={1.5} fill="url(#g2)" dot={false} />
                  <Area type="monotone" dataKey="returns" stroke="#00d4a0" strokeWidth={2} fill="url(#g3)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* MF Holdings */}
            <div>
              <div className="mf-card" style={{ background: "transparent", border: "none", padding: "4px 18px" }}>
                {["Fund Name", "Invested", "Current Value", "Returns"].map(h => (
                  <p key={h} style={{ fontSize: 10, color: "#3d5a6e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px" }}>{h}</p>
                ))}
              </div>
              {MF.map((f, i) => {
                const ret = f.current - f.invested;
                const pct = (((f.current - f.invested) / f.invested) * 100).toFixed(2);
                return (
                  <div key={i} className="mf-card">
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{f.name}</p>
                      <p style={{ fontSize: 10, color: "#3d5a6e", marginTop: 2 }}>{f.units} units · NAV ₹{f.nav}</p>
                    </div>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>₹{fmt(f.invested)}</p>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#00d4a0", fontWeight: 600 }}>₹{fmt(f.current)}</p>
                    <div>
                      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 600, color: "#00d4a0" }}>+₹{fmt(ret)}</p>
                      <span className="badge" style={{ background: "rgba(0,212,160,0.1)", color: "#00d4a0", marginTop: 3 }}>▲ {pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {tab === "analytics" && (
          <div className="fade-in">
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Analytics</h2>
              <p style={{ fontSize: 12, color: "#6b8a9e", marginTop: 2 }}>Deep dive into your portfolio performance</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div className="card">
                <p style={{ fontSize: 12, color: "#6b8a9e", marginBottom: 4 }}>Portfolio vs Nifty 50</p>
                <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Benchmark Comparison</p>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={portfolioHistory.map((p, i) => ({ ...p, nifty: [272000, 285000, 279000, 296000, 308000, 321000][i] }))}>
                    <XAxis dataKey="month" tick={{ fill: "#3d5a6e", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="value" stroke="#00d4a0" strokeWidth={2} dot={false} name="Portfolio" />
                    <Line type="monotone" dataKey="nifty" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Nifty 50" />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 16, height: 2, background: "#00d4a0", borderRadius: 1 }} /><span style={{ fontSize: 11, color: "#6b8a9e" }}>Portfolio +25.6%</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 16, height: 2, background: "#3b82f6", borderRadius: 1 }} /><span style={{ fontSize: 11, color: "#6b8a9e" }}>Nifty 50 +18.0%</span></div>
                </div>
              </div>

              <div className="card">
                <p style={{ fontSize: 12, color: "#6b8a9e", marginBottom: 4 }}>Asset Allocation</p>
                <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Distribution</p>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={[{ name: "Stocks", value: Math.round(totalStockCurrent) }, { name: "Mutual Funds", value: Math.round(totalMFCurrent) }]} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={4}>
                      <Cell fill="#00d4a0" />
                      <Cell fill="#a78bfa" />
                    </Pie>
                    <Tooltip formatter={(v) => `₹${fmt(v)}`} contentStyle={{ background: "#0f1923", border: "1px solid #1e3040", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 10 }}>
                  {[["Stocks", "#00d4a0", `${((totalStockCurrent / totalCurrent) * 100).toFixed(0)}%`], ["Mutual Funds", "#a78bfa", `${((totalMFCurrent / totalCurrent) * 100).toFixed(0)}%`]].map(([label, color, pct]) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: color }} /><span style={{ fontSize: 11, color: "#6b8a9e" }}>{label}</span></div>
                      <p style={{ fontSize: 15, fontWeight: 700, color, marginTop: 2 }}>{pct}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="card">
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Key Performance Metrics</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                {[
                  { label: "XIRR", value: "18.4%", color: "#00d4a0" },
                  { label: "Best Performer", value: "ICICIBANK +15.6%", color: "#3b82f6" },
                  { label: "Worst Performer", value: "HDFCBANK -6.8%", color: "#f87171" },
                  { label: "Unrealised Gain", value: `+${fmtCr(totalPnL)}`, color: "#00d4a0" },
                ].map((m, i) => (
                  <div key={i} style={{ background: "#070d12", borderRadius: 10, padding: "14px 16px", border: "1px solid #111e28" }}>
                    <p style={{ fontSize: 10, color: "#3d5a6e", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>{m.label}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: m.color, fontFamily: "'DM Mono', monospace" }}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
