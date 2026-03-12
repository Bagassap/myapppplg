#!/bin/bash
# scripts/tune-postgres.sh
# Jalankan SEKALI di server Proxmox untuk optimasi PostgreSQL
# Usage: sudo bash scripts/tune-postgres.sh

set -e

PGPASSWORD=pplguyeuye909090
PG_CONN="PGPASSWORD=$PGPASSWORD psql -h localhost -U postgres -d absensi_db"

echo "=== Tuning PostgreSQL untuk 114 concurrent users ==="

# ── 1. PostgreSQL config ──────────────────────────────────────────────────────
PG_CONF=$(sudo -u postgres psql -t -c "SHOW config_file;" | tr -d ' ')
echo "Config file: $PG_CONF"

# Backup config
sudo cp "$PG_CONF" "${PG_CONF}.backup.$(date +%Y%m%d)"

# Apply settings
sudo tee -a "$PG_CONF" > /dev/null << 'PGEOF'

# ── Optimasi untuk absensipkl (114 concurrent users) ──────────────────────────
# max_connections: sedikit lebih dari connection_limit di Prisma (20) × workers PM2 (2) + buffer
max_connections = 60

# shared_buffers: ~25% RAM (sesuaikan dengan RAM Proxmox VM)
# Jika RAM 2GB → 512MB, RAM 4GB → 1GB
shared_buffers = 256MB

# effective_cache_size: ~75% RAM
effective_cache_size = 512MB

# work_mem: RAM per sort/query operation
# 114 connections × work_mem jangan sampai OOM
# 114 × 4MB = 456MB — aman untuk 2GB RAM
work_mem = 4MB

# Logging lambat query (debug)
log_min_duration_statement = 1000
log_line_prefix = '%t [%p] '

# Connection keepalive
tcp_keepalives_idle = 60
tcp_keepalives_interval = 10
PGEOF

echo "Config updated. Restarting PostgreSQL..."
sudo systemctl restart postgresql
sleep 2
echo "PostgreSQL restarted."

# ── 2. Tambah index yang krusial untuk query absensi ─────────────────────────
echo "=== Menambahkan index database ==="

PGPASSWORD=pplguyeuye909090 psql -h localhost -U postgres -d absensi_db << 'SQLEOF'
-- Index untuk query absensi per userId + tanggal (paling sering dipakai)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_absensi_userid_tanggal
  ON "Absensi"("userId", "tanggal" DESC);

-- Index untuk query tanggal saja (admin filter by date)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_absensi_tanggal
  ON "Absensi"("tanggal" DESC);

-- Index untuk DataSiswa guru pembimbing lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_datasiswa_guru
  ON "DataSiswa"("guruPembimbing");

-- Index untuk DataSiswa kelas lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_datasiswa_kelas
  ON "DataSiswa"("kelas");

-- Index untuk User username lookup (NIS)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_username
  ON "User"("username");

-- Index untuk User email lookup (login)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_email
  ON "User"("email");

-- Analyze tables agar query planner up-to-date
ANALYZE "Absensi";
ANALYZE "DataSiswa";
ANALYZE "User";

-- Cek index yang dibuat
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY tablename, indexname;
SQLEOF

echo "=== Index selesai dibuat ==="
echo ""
echo "=== Ringkasan ==="
echo "✓ PostgreSQL max_connections = 60"
echo "✓ Index absensi userId+tanggal, tanggal, guruPembimbing, kelas, username, email"
echo "✓ Prisma connection pool = 20 koneksi"
echo ""
echo "Sekarang restart app:"
echo "  pm2 restart absensi-app --update-env"