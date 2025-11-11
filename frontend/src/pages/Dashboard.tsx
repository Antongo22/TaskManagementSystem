import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/taskService';
import { userService } from '../services/userService';
import { Task, TaskStatus, CreateTaskDto, UpdateTaskDto } from '../types';
import { TaskCard } from '../components/TaskCard';
import { TaskForm } from '../components/TaskForm';
import { useAuth } from '../contexts/AuthContext';
import { useSignalR } from '../hooks/useSignalR';
import toast from 'react-hot-toast';

type TabType = 'tasks' | 'users';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', statusFilter],
    queryFn: () => taskService.getTasks(statusFilter),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTaskDto) => taskService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowForm(false);
      setEditingTask(undefined);
      toast.success('Задача создана');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskDto }) =>
      taskService.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowForm(false);
      setEditingTask(undefined);
      toast.success('Задача обновлена');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Задача удалена');
    },
  });

  useSignalR(() => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  });

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (id: number, status: TaskStatus) => {
    updateMutation.mutate({ id, data: { status } });
  };

  const handleFormSubmit = async (data: CreateTaskDto | UpdateTaskDto) => {
    if (editingTask) {
      await updateMutation.mutateAsync({ id: editingTask.id, data: data as UpdateTaskDto });
    } else {
      await createMutation.mutateAsync(data as CreateTaskDto);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-800">Управление задачами</h1>
            <button
              onClick={logout}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Выйти
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Вкладки */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Задачи
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Пользователи
            </button>
          </nav>
        </div>

        {/* Контент вкладки "Задачи" */}
        {activeTab === 'tasks' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter(undefined)}
                  className={`px-4 py-2 rounded-lg ${
                    statusFilter === undefined
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Все
                </button>
                <button
                  onClick={() => setStatusFilter(TaskStatus.New)}
                  className={`px-4 py-2 rounded-lg ${
                    statusFilter === TaskStatus.New
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Новые
                </button>
                <button
                  onClick={() => setStatusFilter(TaskStatus.InProgress)}
                  className={`px-4 py-2 rounded-lg ${
                    statusFilter === TaskStatus.InProgress
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  В работе
                </button>
                <button
                  onClick={() => setStatusFilter(TaskStatus.Completed)}
                  className={`px-4 py-2 rounded-lg ${
                    statusFilter === TaskStatus.Completed
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Завершенные
                </button>
              </div>
              <button
                onClick={() => {
                  setEditingTask(undefined);
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                + Новая задача
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-12">Загрузка...</div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Нет задач</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Контент вкладки "Пользователи" */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Все пользователи</h2>
            </div>
            <div className="p-6">
              {users.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Нет пользователей</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-indigo-600 font-semibold text-lg">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{user.username}</h3>
                          <p className="text-sm text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <TaskForm
          task={editingTask}
          users={users}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(undefined);
          }}
        />
      )}
    </div>
  );
};
