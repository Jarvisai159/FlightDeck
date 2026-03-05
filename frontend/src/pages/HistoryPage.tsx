import { useState } from 'react'
import { Search, TrendingUp, TrendingDown, AlertTriangle, XCircle, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { getFlightPerformance } from '../data/demoData'

const periodOptions = [30, 90, 180]

export default function HistoryPage() {
  const [query, setQuery] = useState('')
  const [period, setPeriod] = useState(30)
  const [data, setData] = useState<ReturnType<typeof getFlightPerformance> | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setData(getFlightPerformance(query.trim(), period))
    }
  }

  const delayData = data
    ? [
        { name: '<15m', value: data.delay_distribution.under_15, color: '#22c55e' },
        { name: '15-30m', value: data.delay_distribution['15_to_30'], color: '#f59e0b' },
        { name: '30-60m', value: data.delay_distribution['30_to_60'], color: '#f97316' },
        { name: '60m+', value: data.delay_distribution.over_60, color: '#ef4444' },
      ]
    : []

  const statusColor = (s: string) => {
    if (s === 'on_time') return '#22c55e'
    if (s === 'minor_delay') return '#f59e0b'
    if (s === 'major_delay') return '#ef4444'
    if (s === 'cancelled') return '#1e293b'
    return '#334155'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
        <div className="flex items-center bg-bg-secondary border border-border rounded-xl overflow-hidden focus-within:border-accent transition-colors shadow-lg">
          <div className="pl-4"><Search className="w-5 h-5 text-text-muted" /></div>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Enter flight number to check reliability (e.g. EK203)"
            className="flex-1 bg-transparent px-3 py-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none font-mono"
          />
          <button type="submit" className="bg-accent hover:bg-accent-hover text-white px-6 py-3.5 text-sm font-semibold transition-colors">
            Analyze
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          {periodOptions.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => { setPeriod(p); if (data) setData(getFlightPerformance(query.trim(), p)) }}
              className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                period === p
                  ? 'bg-accent text-white'
                  : 'bg-bg-tertiary text-text-muted hover:text-text-primary'
              }`}
            >
              {p} days
            </button>
          ))}
        </div>
      </form>

      {/* Results */}
      {data && (
        <div className="space-y-4 animate-fade-in">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPICard
              label="On-Time Rate"
              value={`${data.on_time_percentage}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              color={data.on_time_percentage >= 75 ? 'text-status-ontime' : data.on_time_percentage >= 50 ? 'text-status-minor-delay' : 'text-status-major-delay'}
            />
            <KPICard
              label="Avg Delay"
              value={`${data.average_delay_minutes}m`}
              icon={<TrendingDown className="w-5 h-5" />}
              color={data.average_delay_minutes <= 10 ? 'text-status-ontime' : data.average_delay_minutes <= 25 ? 'text-status-minor-delay' : 'text-status-major-delay'}
            />
            <KPICard
              label="Cancel Rate"
              value={`${data.cancellation_rate}%`}
              icon={<XCircle className="w-5 h-5" />}
              color={data.cancellation_rate <= 2 ? 'text-status-ontime' : 'text-status-major-delay'}
            />
            <KPICard
              label="Total Flights"
              value={`${data.total_flights}`}
              icon={<Calendar className="w-5 h-5" />}
              color="text-accent"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Delay Distribution Bar Chart */}
            <div className="bg-bg-secondary border border-border rounded-xl p-5">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Delay Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={delayData} barCategoryGap="20%">
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12, fontFamily: 'JetBrains Mono' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {delayData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-bg-secondary border border-border rounded-xl p-5">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Performance Breakdown</h3>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={delayData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {delayData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2">
                {delayData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-[10px] text-text-muted">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar Heatmap */}
          <div className="bg-bg-secondary border border-border rounded-xl p-5">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Daily Performance (Last {Math.min(data.total_flights, 30)} Days)</h3>
            <div className="flex flex-wrap gap-1.5">
              {data.daily_performance.slice(-30).map((day, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-mono cursor-default group relative"
                  style={{ backgroundColor: statusColor(day.status) + '30', border: `1px solid ${statusColor(day.status)}50` }}
                  title={`${day.date}: ${day.status}${day.delay > 0 ? ` (+${day.delay}m)` : ''}`}
                >
                  <span style={{ color: statusColor(day.status) }}>
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ background: '#22c55e30', border: '1px solid #22c55e50' }} /><span className="text-[10px] text-text-muted">On Time</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ background: '#f59e0b30', border: '1px solid #f59e0b50' }} /><span className="text-[10px] text-text-muted">Minor Delay</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ background: '#ef444430', border: '1px solid #ef444450' }} /><span className="text-[10px] text-text-muted">Major Delay</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ background: '#1e293b30', border: '1px solid #1e293b50' }} /><span className="text-[10px] text-text-muted">Cancelled</span></div>
            </div>
          </div>

          {/* Best / Worst Days */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-bg-secondary border border-border rounded-xl p-5">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Best Days to Fly</h3>
              <div className="flex gap-2">
                {data.best_days.map(day => (
                  <span key={day} className="text-sm font-semibold text-status-ontime bg-status-ontime/10 px-3 py-1.5 rounded-lg">{day}</span>
                ))}
              </div>
            </div>
            <div className="bg-bg-secondary border border-border rounded-xl p-5">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Worst Days to Fly</h3>
              <div className="flex gap-2">
                {data.worst_days.map(day => (
                  <span key={day} className="text-sm font-semibold text-status-major-delay bg-status-major-delay/10 px-3 py-1.5 rounded-lg">{day}</span>
                ))}
              </div>
              {data.worst_days.length > 0 && (
                <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-status-minor-delay" />
                  Consider avoiding these days when booking
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!data && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-bg-secondary border border-border mb-4">
            <TrendingUp className="w-8 h-8 text-text-muted" />
          </div>
          <h2 className="text-lg font-semibold text-text-secondary mb-1">Flight reliability report card</h2>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            Enter a flight number to see its on-time performance, delay patterns, and the best days to fly.
          </p>
        </div>
      )}
    </div>
  )
}

function KPICard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{label}</span>
        <span className={color}>{icon}</span>
      </div>
      <p className={`font-mono text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
