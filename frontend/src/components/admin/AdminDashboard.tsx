import { useNavigate } from 'react-router-dom';

// Tarjeta stat simple
interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
  onClick?: () => void;
}

const colorClasses = {
  blue: 'border-blue-200 bg-blue-50',
  green: 'border-green-200 bg-green-50',
  orange: 'border-orange-200 bg-orange-50',
  purple: 'border-purple-200 bg-purple-50',
};


function StatCard({ title, value, icon, color, onClick }: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${
        onClick ? 'cursor-pointer hover:border-slate-300' : 'cursor-default'
      } ${colorClasses[color]}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </button>
  );
}

// Tarjeta de Quick Action
interface QuickActionProps {
  title: string;
  description: string;
  icon: string;
  href: string;
}

function QuickAction({ title, description, icon, href }: QuickActionProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(href)}
      className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left transition-all hover:border-blue-300 hover:shadow-md"
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </button>
  );
}

interface AdminDashboardProps {
  stats?: {
    usuariosActivos: number;
    reservasPendientes: number;
    instalacionesDisponibles: number;
    reservasHoy: number;
  };
}

/**
 * Componente de Dashboard Admin con estadísticas y quick actions
 */
export function AdminDashboard({
  stats = {
    usuariosActivos: 0,
    reservasPendientes: 0,
    instalacionesDisponibles: 0,
    reservasHoy: 0,
  },
}: AdminDashboardProps) {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel de Administración</h1>
        <p className="text-slate-500">Bienvenido al panel de administración de UniDeportes</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Usuarios Activos"
          value={stats.usuariosActivos}
          icon="👥"
          color="blue"
          onClick={() => navigate('/admin/usuarios')}
        />
        <StatCard
          title="Reservas Pendientes"
          value={stats.reservasPendientes}
          icon="📋"
          color="orange"
          onClick={() => navigate('/admin/reservas')}
        />
        <StatCard
          title="Instalaciones Disponibles"
          value={stats.instalacionesDisponibles}
          icon="🏟️"
          color="green"
          onClick={() => navigate('/admin/instalaciones')}
        />
        <StatCard
          title="Reservas Hoy"
          value={stats.reservasHoy}
          icon="📅"
          color="purple"
          onClick={() => navigate('/admin/reservas')}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            title="Gestionar Usuarios"
            description="Crear, editar, bloquear usuarios"
            icon="👥"
            href="/admin/usuarios"
          />
          <QuickAction
            title="Gestionar Instalaciones"
            description="Administrar canchas y escenarios"
            icon="🏟️"
            href="/admin/instalaciones"
          />
          <QuickAction
            title="Gestionar Deportes"
            description="Agregar nuevo deporte"
            icon="⚽"
            href="/admin/deportes"
          />
          <QuickAction
            title="Ver Reservas"
            description="Ver todas las reservas"
            icon="📅"
            href="/admin/reservas"
          />
        </div>
      </div>
    </div>
  );
}
