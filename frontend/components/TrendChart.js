// Grafik area garis SVG modern untuk tren skor kolaborasi per periode
export default function TrendChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="muted" style={{ padding: '1.5rem 0', textAlign: 'center' }}>Belum ada data survei.</p>;
  }

  const W = 540;
  const H = 240;
  const L = 42;
  const R = 24;
  const T = 28;
  const B = 36;

  const x = (i) =>
    data.length === 1 ? (L + W - R) / 2 : L + (i * (W - L - R)) / (data.length - 1);
  const y = (v) => T + ((5 - v) * (H - T - B)) / 4; // skala 1-5

  const pts = data.map((d, i) => `${x(i)},${y(d.skorTotal)}`).join(' ');
  const areaPts = `${x(0)},${H - B} ${pts} ${x(data.length - 1)},${H - B}`;

  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '0.5rem 0' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="chart"
        role="img"
        aria-label="Tren skor kolaborasi"
        style={{ display: 'block', margin: '0 auto' }}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2563eb" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Horizontal grid lines & Y labels */}
        {[1, 2, 3, 4, 5].map((v) => (
          <g key={v}>
            <line
              x1={L}
              x2={W - R}
              y1={y(v)}
              y2={y(v)}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
            <text
              x={L - 10}
              y={y(v) + 4}
              textAnchor="end"
              fontSize="11"
              fontWeight="600"
              fill="#94a3b8"
            >
              {v}.0
            </text>
          </g>
        ))}

        {/* Gradient fill under the curve */}
        {data.length > 1 && (
          <polygon points={areaPts} fill="url(#areaGradient)" />
        )}

        {/* Connecting line */}
        {data.length > 1 && (
          <polyline
            points={pts}
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points and labels */}
        {data.map((d, i) => {
          const cx = x(i);
          const cy = y(d.skorTotal);
          return (
            <g key={d.periodeKe}>
              {/* Outer halo */}
              <circle cx={cx} cy={cy} r="7" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
              <circle cx={cx} cy={cy} r="3" fill="#2563eb" />

              {/* Value pill label */}
              <g transform={`translate(${cx}, ${cy - 12})`}>
                <rect
                  x="-16"
                  y="-16"
                  width="32"
                  height="18"
                  rx="4"
                  fill="#1e293b"
                />
                <text
                  x="0"
                  y="-4"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="#ffffff"
                >
                  {Number(d.skorTotal).toFixed(1)}
                </text>
              </g>

              {/* X Axis period label */}
              <text
                x={cx}
                y={H - 12}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="#475569"
              >
                P{d.periodeKe}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
