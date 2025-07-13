import React from 'react';
import { Tv, Film, MonitorPlay, Plus, Settings, Download } from 'lucide-react';

interface CategoryTabsProps {
  activeCategory: 'live' | 'movies' | 'series';
  onCategoryChange: (category: 'live' | 'movies' | 'series') => void;
  onAddChannel: () => void;
  onShowSettings: () => void;
  onLoadPlaylist: () => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  onCategoryChange,
  onAddChannel,
  onShowSettings,
  onLoadPlaylist,
}) => {
  const tabs = [
    { id: 'live' as const, label: 'Live TV', icon: Tv, color: 'from-blue-500 to-cyan-500' },
    { id: 'movies' as const, label: 'Movies', icon: Film, color: 'from-red-500 to-pink-500' },
    { id: 'series' as const, label: 'Series', icon: MonitorPlay, color: 'from-purple-500 to-indigo-500' },
  ];

  return (
    <div className="bg-gray-800 border-b border-gray-700">
      <div className="flex items-center justify-between p-4">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onCategoryChange(tab.id)}
                className={`relative px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeCategory === tab.id
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {activeCategory === tab.id && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-lg opacity-20`} />
                )}
                <Icon size={18} />
                <span className="relative">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onLoadPlaylist}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Load M3U
          </button>
          
          <button
            onClick={onAddChannel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Channel
          </button>
          
          <button
            onClick={onShowSettings}
            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;