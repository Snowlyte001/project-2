import React from 'react';
import { Zap } from 'lucide-react';

export function BoltBadge() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm font-medium"
        title="Built with Bolt.new"
      >
        <Zap className="w-4 h-4" />
        <span>Built with Bolt.new</span>
      </a>
    </div>
  );
}