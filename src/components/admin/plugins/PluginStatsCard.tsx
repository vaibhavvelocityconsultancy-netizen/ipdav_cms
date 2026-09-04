"use client";

interface PluginStatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
}

export function PluginStatsCard({ title, value, icon, color = 'text-purple-600' }: PluginStatsCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')} bg-purple-100`}>
          <div className={color}>{icon}</div>
        </div>
      </div>
    </div>
  );
}