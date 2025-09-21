import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import Modal from '../components/common/Modal';
import { 
  Calendar,
  Download,
  Filter,
  Search,
  User,
  Activity,
  Clock,
  Database,
  FileText,
  Settings,
  Users,
  FolderOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { activityService } from '../services/activityService';
import { useAuth } from '../hooks/useAuth';

const ActivityLogsPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    userId: '',
    entityType: '',
    action: '',
    page: 1,
    limit: 50
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debug: Log user information
  console.log('ActivityLogsPage - User info:', user);
  console.log('ActivityLogsPage - es_administrador:', user?.es_administrador);
  console.log('ActivityLogsPage - roles:', user?.roles);

  // Manejar click en fila para mostrar detalles
  const handleRowClick = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  // Cargar logs de actividad
  const loadActivityLogs = async () => {
    try {
      console.log('ActivityLogsPage - loadActivityLogs - Starting with filters:', filters);
      setLoading(true);
      const response = await activityService.getActivityLogs(filters);
      console.log('ActivityLogsPage - loadActivityLogs - Response:', response);
      setLogs(response.data || []);
      setPagination(response.pagination || { page: 1, limit: 50, total: 0 });
      console.log('ActivityLogsPage - loadActivityLogs - Logs set:', response.data?.length || 0, 'logs');
    } catch (error) {
      console.error('Error loading activity logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      console.log('ActivityLogsPage - loadStats - Starting');
      const response = await activityService.getActivityStats();
      console.log('ActivityLogsPage - loadStats - Response:', response);
      setStats(response.data || []);
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats([]);
    }
  };

  useEffect(() => {
    // Verificar si el usuario es admin por el campo es_administrador o por roles
    const isAdmin = (user?.es_administrador === 1 || user?.es_administrador === true) || user?.roles?.includes('admin');
    console.log('ActivityLogsPage - Final isAdmin check:', isAdmin);
    
    if (isAdmin) {
      loadActivityLogs();
      loadStats();
    } else {
      console.log('ActivityLogsPage - User is not admin, not loading logs');
    }
  }, [user, filters]);

  // Manejar cambios en filtros
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset page when filters change
    }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      userId: '',
      entityType: '',
      action: '',
      page: 1,
      limit: 50
    });
  };

  // Exportar logs
  const exportLogs = async (format = 'json') => {
    try {
      const response = await activityService.exportLogs({
        ...filters,
        format
      });
      
      if (format === 'csv') {
        // El backend devuelve CSV directamente
        const blob = new Blob([response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // JSON format
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
          type: 'application/json' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  // Obtener icono para el tipo de acción
  const getActionIcon = (action) => {
    const iconMap = {
      'crear': Plus,
      'actualizar': Edit,
      'eliminar': Trash2,
      'ver': Eye,
      'login': User,
      'logout': User,
      'cambio_estado': Settings,
      'asignacion': Users,
      'subir_archivo': FileText,
      'descargar_archivo': Download
    };
    
    const IconComponent = iconMap[action] || Activity;
    return <IconComponent className="h-4 w-4" />;
  };

  // Obtener color para el tipo de acción
  const getActionColor = (action) => {
    const colorMap = {
      'crear': 'bg-green-100 text-green-800',
      'actualizar': 'bg-blue-100 text-blue-800',
      'eliminar': 'bg-red-100 text-red-800',
      'ver': 'bg-gray-100 text-gray-800',
      'login': 'bg-purple-100 text-purple-800',
      'logout': 'bg-orange-100 text-orange-800',
      'cambio_estado': 'bg-yellow-100 text-yellow-800',
      'asignacion': 'bg-indigo-100 text-indigo-800',
      'subir_archivo': 'bg-cyan-100 text-cyan-800',
      'descargar_archivo': 'bg-teal-100 text-teal-800'
    };
    
    return colorMap[action] || 'bg-gray-100 text-gray-800';
  };

  // Obtener icono para el tipo de entidad
  const getEntityIcon = (entityType) => {
    const iconMap = {
      'usuario': User,
      'proyecto': FolderOpen,
      'tarea': CheckCircle,
      'archivo': FileText,
      'rol': Settings
    };
    
    const IconComponent = iconMap[entityType] || Database;
    return <IconComponent className="h-4 w-4" />;
  };

  // Verificar si el usuario es admin por el campo es_administrador o por roles
  const isAdmin = (user?.es_administrador === 1 || user?.es_administrador === true) || user?.roles?.includes('admin');
  
  console.log('ActivityLogsPage - Render isAdmin check:', isAdmin);
  console.log('ActivityLogsPage - User in render:', user);
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Acceso Denegado
              </h3>
              <p className="text-gray-600">
                No tienes permisos para ver los logs de actividad del sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Logs de Actividad
        </h1>
        <p className="text-gray-600">
          Monitorea y audita todas las actividades del sistema
        </p>
      </div>

      {/* Estadísticas */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Actividades
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.reduce((acc, stat) => acc + stat.total, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Usuarios Activos
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(logs.map(log => log.usuario_id)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tipos de Entidad
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(stats.map(stat => stat.entidad_tipo)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Últimas 24h
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {logs.filter(log => {
                      const logDate = new Date(log.created_at);
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      return logDate >= yesterday;
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin
              </label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Entidad
              </label>
              <Select
                value={filters.entityType}
                onValueChange={(value) => handleFilterChange('entityType', value)}
              >
                <SelectTrigger data-testid="entity-type-select">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="proyecto">Proyecto</SelectItem>
                  <SelectItem value="tarea">Tarea</SelectItem>
                  <SelectItem value="usuario">Usuario</SelectItem>
                  <SelectItem value="archivo">Archivo</SelectItem>
                  <SelectItem value="rol">Rol</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acción
              </label>
              <Select
                value={filters.action}
                onValueChange={(value) => handleFilterChange('action', value)}
              >
                <SelectTrigger data-testid="filter-select">
                  <SelectValue placeholder="Todas las acciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las acciones</SelectItem>
                  <SelectItem value="crear">Crear</SelectItem>
                  <SelectItem value="actualizar">Actualizar</SelectItem>
                  <SelectItem value="eliminar">Eliminar</SelectItem>
                  <SelectItem value="ver">Ver</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="cambio_estado">Cambio Estado</SelectItem>
                  <SelectItem value="asignacion">Asignación</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-4">
            <Input
              type="text"
              placeholder="Buscar por usuario, descripción o IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
              data-testid="search-input"
            />
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </Button>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => exportLogs('json')}
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => exportLogs('csv')}
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Registro de Actividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Cargando logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8" data-testid="no-data-message">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay logs disponibles
              </h3>
              <p className="text-gray-600">
                No se encontraron registros de actividad con los filtros aplicados.
              </p>
            </div>
          ) : (
            <>
              <Table data-testid="activity-logs-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Entidad</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow 
                      key={log.id} 
                      data-testid="activity-log-row"
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleRowClick(log)}
                    >
                      <TableCell data-testid="timestamp">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="font-medium">
                              {format(new Date(log.created_at), 'dd/MM/yyyy', { locale: es })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(log.created_at), 'HH:mm:ss', { locale: es })}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell data-testid="user-name">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="font-medium">
                              {log.usuario_nombre || 'Usuario desconocido'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {log.usuario_email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell data-testid="action-type">
                        <Badge className={`flex items-center ${getActionColor(log.accion)}`}>
                          {getActionIcon(log.accion)}
                          <span className="ml-1 capitalize">{log.accion}</span>
                        </Badge>
                      </TableCell>
                      <TableCell data-testid="resource-type">
                        <div className="flex items-center">
                          {getEntityIcon(log.entidad_tipo)}
                          <div className="ml-2">
                            <div className="font-medium capitalize">
                              {log.entidad_tipo}
                            </div>
                            {log.entidad_id && (
                              <div className="text-sm text-gray-500">
                                ID: {log.entidad_id}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={log.descripcion}>
                          {log.descripcion}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500 font-mono">
                          {log.ip_address || 'N/A'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginación */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                  {Math.min(pagination.page * pagination.limit, logs.length)} de{' '}
                  {logs.length} registros
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange('page', Math.max(1, pagination.page - 1))}
                    disabled={pagination.page <= 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange('page', pagination.page + 1)}
                    disabled={logs.length < pagination.limit}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

       {/* Modal de Detalles */}
       <Modal
         isOpen={isModalOpen}
         onClose={closeModal}
         title="Detalles del Log de Actividad"
         data-testid="log-details-modal"
       >
         {selectedLog && (
           <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Fecha y Hora
                 </label>
                 <p className="text-sm text-gray-900">
                   {format(new Date(selectedLog.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                 </p>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Usuario
                 </label>
                 <p className="text-sm text-gray-900">
                   {selectedLog.usuario_nombre || 'Usuario desconocido'}
                 </p>
                 <p className="text-xs text-gray-500">
                   {selectedLog.usuario_email}
                 </p>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Acción
                 </label>
                 <Badge className={`inline-flex items-center ${getActionColor(selectedLog.accion)}`}>
                   {getActionIcon(selectedLog.accion)}
                   <span className="ml-1 capitalize">{selectedLog.accion}</span>
                 </Badge>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Tipo de Entidad
                 </label>
                 <div className="flex items-center">
                   {getEntityIcon(selectedLog.entidad_tipo)}
                   <span className="ml-2 text-sm text-gray-900 capitalize">
                     {selectedLog.entidad_tipo}
                   </span>
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   ID de Entidad
                 </label>
                 <p className="text-sm text-gray-900">
                   {selectedLog.entidad_id || 'N/A'}
                 </p>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Dirección IP
                 </label>
                 <p className="text-sm text-gray-900 font-mono">
                   {selectedLog.ip_address || 'N/A'}
                 </p>
               </div>
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Descripción
               </label>
               <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                 {selectedLog.descripcion}
               </p>
             </div>
             {selectedLog.detalles_adicionales && (
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Detalles Adicionales
                 </label>
                 <pre className="text-xs text-gray-900 bg-gray-50 p-3 rounded-md overflow-auto max-h-40">
                   {JSON.stringify(selectedLog.detalles_adicionales, null, 2)}
                 </pre>
               </div>
             )}
           </div>
         )}
       </Modal>
     </div>
   );
 };

export default ActivityLogsPage;