
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'funnel', label: 'Funil Matemático', icon: '📐' },
    { id: 'matrix', label: 'Matriz de Resp.', icon: '📋' },
    { id: 'routine', label: 'Rotina Comercial', icon: '🗓️' },
    { id: 'pdca', label: 'PDCA & Gargalos', icon: '🔄' },
  ];

  return (
    <div className="w-64 bg-slate-950 text-slate-300 h-screen fixed left-0 top-0 flex flex-col z-20 transition-all duration-300">
      <div className="p-6">
        <h1 className="text-white text-xl font-black flex items-center gap-2 tracking-tighter">
          <span className="text-purple-500">DNA</span> FOR SMALL
        </h1>
        <p className="text-[10px] text-purple-400/60 mt-1 uppercase tracking-widest font-bold">Consultor Digital</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === item.id
                ? 'bg-purple-700 text-white shadow-lg shadow-purple-900/40'
                : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-900">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-200">
            GC
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">Gestor Comercial</p>
            <p className="text-[10px] text-slate-500 truncate">DNA FOR SMALL Demo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
