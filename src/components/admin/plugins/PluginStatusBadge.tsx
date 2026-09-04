"use client";

interface PluginStatusBadgeProps {
  status: 'active' | 'inactive' | 'installed' | 'available';
}

export function PluginStatusBadge({ status }: PluginStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500'
        };
      case 'inactive':
        return {
          label: 'Inactive',
          className: 'bg-gray-50 text-gray-700 border-gray-200',
          dot: 'bg-gray-400'
        };
      case 'installed':
        return {
          label: 'Installed',
          className: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-500'
        };
      case 'available':
        return {
          label: 'Available',
          className: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500'
        };
      default:
        return {
          label: status,
          className: 'bg-gray-50 text-gray-700 border-gray-200',
          dot: 'bg-gray-400'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}