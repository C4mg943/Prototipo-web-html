interface NavItem {
  path: string;
  label: string;
  icon: string;
}

interface VigilanteSidebarProps {
  items: NavItem[];
  activePath: string;
  onNavigate: (path: string) => void;
}

export function VigilanteSidebar({
  items,
  activePath,
  onNavigate,
}: VigilanteSidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 bg-emerald-800 text-white">
      {/* Logo */}
      <div className="border-b border-emerald-700 p-4">
        <h1 className="text-xl font-bold text-white">UniDeportes</h1>
        <p className="text-sm text-emerald-300">Panel de Vigilancia</p>
      </div>

      {/* Navegación */}
      <nav className="p-2">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = item.path === activePath || 
              (item.path !== '/vigilante' && activePath.startsWith(item.path));
            return (
              <li key={item.path}>
                <button
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-emerald-200 hover:bg-emerald-700 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-64 border-t border-emerald-700 p-4">
        <p className="text-xs text-emerald-400">v1.0.0 • UniDeportes</p>
      </div>
    </aside>
  );
}