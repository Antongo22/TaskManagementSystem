import { useState, useEffect } from 'react';
import { Task, CreateTaskDto, UpdateTaskDto, TaskStatus, UserDto } from '../types';

interface TaskFormProps {
  task?: Task;
  users: UserDto[];
  onSubmit: (data: CreateTaskDto | UpdateTaskDto) => Promise<void>;
  onCancel: () => void;
}

export const TaskForm = ({ task, users, onSubmit, onCancel }: TaskFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.New);
  const [assignedToUserId, setAssignedToUserId] = useState<number | undefined>();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setAssignedToUserId(task.assignedToUserId);
    } else {
      // Сброс формы при создании новой задачи
      setTitle('');
      setDescription('');
      setStatus(TaskStatus.New);
      setAssignedToUserId(undefined);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Явно передаем null вместо undefined для снятия назначения
    const assignedToUserIdValue = assignedToUserId === undefined ? null : assignedToUserId;
    const data = task
      ? { title, description, status, assignedToUserId: assignedToUserIdValue }
      : { title, description, assignedToUserId: assignedToUserIdValue };
    await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{task ? 'Редактировать задачу' : 'Новая задача'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Назначить пользователю</label>
            <select
              value={assignedToUserId || ''}
              onChange={(e) => setAssignedToUserId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Не назначено</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          {task && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
              <select
                value={status}
                onChange={(e) => setStatus(Number(e.target.value) as TaskStatus)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value={TaskStatus.New}>Новая</option>
                <option value={TaskStatus.InProgress}>В работе</option>
                <option value={TaskStatus.Completed}>Завершена</option>
              </select>
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {task ? 'Сохранить' : 'Создать'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

