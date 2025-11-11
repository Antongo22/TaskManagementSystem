import { Task, TaskStatus } from '../types';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: TaskStatus) => void;
}

const statusColors = {
  [TaskStatus.New]: 'bg-blue-100 text-blue-800',
  [TaskStatus.InProgress]: 'bg-yellow-100 text-yellow-800',
  [TaskStatus.Completed]: 'bg-green-100 text-green-800',
};

const statusLabels = {
  [TaskStatus.New]: 'Новая',
  [TaskStatus.InProgress]: 'В работе',
  [TaskStatus.Completed]: 'Завершена',
};

export const TaskCard = ({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) => {
  const isUnassigned = !task.assignedToUserId;
  return (
    <div className={`rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${
      isUnassigned 
        ? 'bg-red-50 border-2 border-red-300' 
        : 'bg-white'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{task.title}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status]}`}>
          {statusLabels[task.status]}
        </span>
      </div>
      <p className="text-gray-600 mb-4">{task.description}</p>
      <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-500">
        <span>Создано: {format(new Date(task.createdAt), 'dd MMM yyyy')}</span>
        {task.assignedToUsername ? (
          <span>• Назначено: {task.assignedToUsername}</span>
        ) : (
          <span className="text-red-600 font-medium">• Не назначена</span>
        )}
      </div>
      <div className="flex gap-2">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, Number(e.target.value) as TaskStatus)}
          className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
        >
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          onClick={() => onEdit(task)}
          className="px-4 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 transition-colors"
        >
          Редактировать
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="px-4 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
        >
          Удалить
        </button>
      </div>
    </div>
  );
};

