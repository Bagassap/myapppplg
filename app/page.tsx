// app/page.tsx
// Ganti sementara dengan halaman maintenance
// Untuk mengembalikan: hapus file ini dan kembalikan app/page.tsx ke versi landing page

export default function MaintenancePage() {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Sedang Maintenance — Sistem Presensi PKL</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          :root {
            --bg:        #060910;
            --surface:   #0d1117;
            --border:    rgba(255,255,255,0.07);
            --accent:    #3b82f6;
            --accent2:   #06b6d4;
            --warn:      #f59e0b;
            --text:      #e2e8f0;
            --muted:     #64748b;
            --glow:      rgba(59,130,246,0.15);
          }

          body {
            background: var(--bg);
            color: var(--text);
            font-family: 'Sora', sans-serif;
            min-height: 100vh;
            overflow-x: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          /* ── Grid background ── */
          body::before {
            content: '';
            position: fixed;
            inset: 0;
            background-image:
              linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
            background-size: 48px 48px;
            pointer-events: none;
            z-index: 0;
          }

          /* ── Glowing orbs ── */
          .orb {
            position: fixed;
            border-radius: 50%;
            filter: blur(80px);
            pointer-events: none;
            z-index: 0;
            animation: drift 12s ease-in-out infinite alternate;
          }
          .orb-1 {
            width: 500px; height: 500px;
            background: radial-gradient(circle, rgba(59,130,246,0.18), transparent 70%);
            top: -150px; left: -100px;
            animation-delay: 0s;
          }
          .orb-2 {
            width: 400px; height: 400px;
            background: radial-gradient(circle, rgba(6,182,212,0.12), transparent 70%);
            bottom: -100px; right: -80px;
            animation-delay: -4s;
          }
          .orb-3 {
            width: 300px; height: 300px;
            background: radial-gradient(circle, rgba(245,158,11,0.08), transparent 70%);
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            animation-delay: -8s;
          }

          @keyframes drift {
            from { transform: translate(0, 0) scale(1); }
            to   { transform: translate(30px, 20px) scale(1.05); }
          }

          /* ── Main card ── */
          .card {
            position: relative;
            z-index: 1;
            background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
            border: 1px solid var(--border);
            border-radius: 28px;
            padding: 56px 48px;
            max-width: 560px;
            width: calc(100% - 32px);
            text-align: center;
            backdrop-filter: blur(20px);
            box-shadow:
              0 0 0 1px rgba(59,130,246,0.08),
              0 32px 80px rgba(0,0,0,0.5),
              inset 0 1px 0 rgba(255,255,255,0.06);
            animation: cardIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
          }

          @keyframes cardIn {
            from { opacity: 0; transform: translateY(32px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }

          /* ── Icon gear ── */
          .icon-wrap {
            position: relative;
            width: 96px;
            height: 96px;
            margin: 0 auto 32px;
          }

          .icon-ring {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            border: 1.5px solid rgba(59,130,246,0.3);
            animation: ringPulse 3s ease-in-out infinite;
          }
          .icon-ring:nth-child(2) {
            inset: -12px;
            border-color: rgba(59,130,246,0.15);
            animation-delay: -1s;
          }
          .icon-ring:nth-child(3) {
            inset: -24px;
            border-color: rgba(59,130,246,0.07);
            animation-delay: -2s;
          }

          @keyframes ringPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%       { opacity: 0.4; transform: scale(1.04); }
          }

          .icon-bg {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.1));
            border: 1px solid rgba(59,130,246,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .gear-svg {
            width: 44px;
            height: 44px;
            animation: spin 8s linear infinite;
            color: #3b82f6;
          }
          .gear-svg-inner {
            width: 28px;
            height: 28px;
            animation: spin 5s linear infinite reverse;
            color: #06b6d4;
            margin-top: -8px;
            margin-left: -8px;
            position: absolute;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }

          /* ── Badge ── */
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 5px 14px;
            background: rgba(245,158,11,0.12);
            border: 1px solid rgba(245,158,11,0.25);
            border-radius: 99px;
            font-size: 11px;
            font-weight: 600;
            color: #fbbf24;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin-bottom: 20px;
            animation: cardIn 0.8s 0.1s both;
          }

          .badge-dot {
            width: 6px;
            height: 6px;
            background: #f59e0b;
            border-radius: 50%;
            animation: blink 1.4s ease-in-out infinite;
          }

          @keyframes blink {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.2; }
          }

          /* ── Typography ── */
          h1 {
            font-size: clamp(26px, 5vw, 36px);
            font-weight: 800;
            line-height: 1.2;
            letter-spacing: -0.03em;
            margin-bottom: 12px;
            background: linear-gradient(135deg, #e2e8f0 30%, #94a3b8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: cardIn 0.8s 0.15s both;
          }

          .desc {
            color: var(--muted);
            font-size: 15px;
            line-height: 1.7;
            margin-bottom: 36px;
            animation: cardIn 0.8s 0.2s both;
          }

          /* ── Progress bar ── */
          .progress-wrap {
            margin-bottom: 32px;
            animation: cardIn 0.8s 0.25s both;
          }

          .progress-label {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: var(--muted);
            margin-bottom: 8px;
            font-family: 'JetBrains Mono', monospace;
          }

          .progress-track {
            height: 4px;
            background: rgba(255,255,255,0.06);
            border-radius: 99px;
            overflow: hidden;
          }

          .progress-fill {
            height: 100%;
            width: 72%;
            background: linear-gradient(90deg, #3b82f6, #06b6d4);
            border-radius: 99px;
            position: relative;
            animation: fillProgress 2s cubic-bezier(0.16,1,0.3,1) 0.5s both;
          }

          @keyframes fillProgress {
            from { width: 0%; }
            to   { width: 72%; }
          }

          .progress-fill::after {
            content: '';
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            box-shadow: 0 0 8px #3b82f6;
          }

          /* ── Info grid ── */
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 32px;
            animation: cardIn 0.8s 0.3s both;
          }

          .info-item {
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 14px 16px;
            text-align: left;
          }

          .info-item-label {
            font-size: 10px;
            color: var(--muted);
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin-bottom: 4px;
            font-family: 'JetBrains Mono', monospace;
          }

          .info-item-value {
            font-size: 13px;
            font-weight: 600;
            color: var(--text);
          }

          .status-online {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            color: #34d399;
            font-size: 13px;
            font-weight: 600;
          }

          .status-dot {
            width: 6px; height: 6px;
            background: #34d399;
            border-radius: 50%;
            animation: blink 2s ease-in-out infinite;
          }

          /* ── Button ── */
          .btn-refresh {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 28px;
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            font-family: 'Sora', sans-serif;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 8px 24px rgba(59,130,246,0.3);
            animation: cardIn 0.8s 0.35s both;
          }

          .btn-refresh:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 32px rgba(59,130,246,0.4);
          }

          .btn-refresh:active {
            transform: translateY(0);
          }

          .refresh-icon {
            width: 16px;
            height: 16px;
            transition: transform 0.4s ease;
          }

          .btn-refresh:hover .refresh-icon {
            transform: rotate(180deg);
          }

          /* ── Footer ── */
          .footer-text {
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 12px;
            color: rgba(100,116,139,0.6);
            white-space: nowrap;
            z-index: 1;
            font-family: 'JetBrains Mono', monospace;
          }

          @media (max-width: 480px) {
            .card { padding: 40px 24px; }
            .info-grid { grid-template-columns: 1fr; }
          }
        `}</style>
      </head>
      <body>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="card">
          {/* Icon */}
          <div className="icon-wrap">
            <div className="icon-ring" />
            <div className="icon-ring" />
            <div className="icon-ring" />
            <div className="icon-bg">
              <svg
                className="gear-svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          {/* Badge */}
          <div className="badge">
            <span className="badge-dot" />
            Maintenance Mode
          </div>

          {/* Title */}
          <h1>
            Sistem Sedang
            <br />
            Dalam Perbaikan
          </h1>

          {/* Description */}
          <p className="desc">
            Kami sedang melakukan pembaruan sistem untuk meningkatkan performa
            dan keamanan aplikasi. Silakan kembali dalam beberapa saat.
          </p>

          {/* Progress */}
          <div className="progress-wrap">
            <div className="progress-label">
              <span>Progress perbaikan</span>
              <span>72%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" />
            </div>
          </div>

          {/* Info grid */}
          <div className="info-grid">
            <div className="info-item">
              <div className="info-item-label">Status</div>
              <div className="status-online">
                <span className="status-dot" />
                Server Online
              </div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Estimasi Selesai</div>
              <div className="info-item-value">Segera</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Sistem</div>
              <div className="info-item-value">Presensi PKL</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Versi</div>
              <div
                className="info-item-value"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                v2.0.0
              </div>
            </div>
          </div>

          {/* Button */}
          <button
            className="btn-refresh"
            onClick={() => window.location.reload()}
          >
            <svg
              className="refresh-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Coba Lagi
          </button>
        </div>

        <p className="footer-text">© 2025 Sistem Presensi PKL — PPLG</p>
      </body>
    </html>
  );
}
