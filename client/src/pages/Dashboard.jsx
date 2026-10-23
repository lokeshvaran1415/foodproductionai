import { useAuth, normalizeRole } from '../context/AuthContext';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import ProductionDashboard from '../components/dashboards/ProductionDashboard';
import PlannerDashboard from '../components/dashboards/PlannerDashboard';
import InventoryDashboard from '../components/dashboards/InventoryDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const roleKey = normalizeRole(user?.roleKey || user?.role);

  switch (roleKey) {
    case 'production_manager':
      return <ProductionDashboard user={user} />;
    case 'demand_planner':
      return <PlannerDashboard user={user} />;
    case 'inventory_manager':
      return <InventoryDashboard user={user} />;
    case 'admin':
    default:
      return <AdminDashboard user={user} />;
  }
}
