interface StatsCardProps {
  label: string;
  value: string;
  icon: string;
  color?: string;
}

export default function StatsCard({
  label,
  value,
  icon,
  color = "#12AAFF",
}: StatsCardProps) {
  return (
    <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <p className="text-sm text-[#8B949E]">{label}</p>
      </div>
      <p className="text-2xl font-bold font-mono" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
