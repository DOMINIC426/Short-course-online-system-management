export default function StatusBadge({ status }) {
  const isConnected = status === 'Connected';

  return (
    <span
      className={`inline-flex items-center rounded px-3 py-1 text-sm font-medium ${
        isConnected
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-red-100 text-red-800'
      }`}
    >
      {status}
    </span>
  );
}
