const WARNA = {
  'Baik': 'green',
  'Perlu Dipantau': 'amber',
  'Perlu Fasilitasi': 'red',
  'Belum Ada Data': 'gray',
};

export default function StatusBadge({ status }) {
  const colorClass = WARNA[status] || 'gray';
  return (
    <span className={`badge ${colorClass}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}
