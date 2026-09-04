"use client";

import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

interface PluginActionMenuProps {
  actions: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    danger?: boolean;
  }[];
}

export function PluginActionMenu({ actions }: PluginActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 ${
                action.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
              }`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}