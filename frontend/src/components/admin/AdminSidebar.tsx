interface NavItem {
  path: string;
  label: string;
  icon?: string;
}

interface AdminSidebarProps {
  items: NavItem[];
  activePath: string;
  onNavigate: (path: string) => void;
}

export function AdminSidebar({
  items,
  activePath,
  onNavigate,
}: AdminSidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 text-white">
      {/* Logo */}
      <div className="border-b border-slate-700 p-4">
        <h1 className="text-xl font-bold text-white">UniDeportes</h1>
        <p className="text-sm text-slate-400">Panel de Administración</p>
      </div>

      {/* Navegación */}
      <nav className="p-2">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = item.path === activePath || 
              (item.path !== '/admin' && activePath.startsWith(item.path));
            return (
              <li key={item.path}>
                <button
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.icon ? <span className="text-lg">{item.icon}</span> : null}
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer del sidebar */}
      <div className="absolute bottom-0 w-64 border-t border-slate-700 p-4">
        <p className="text-xs text-slate-500">v1.0.0 • UniDeportes</p>
      </div>
    </aside>
  );
}
