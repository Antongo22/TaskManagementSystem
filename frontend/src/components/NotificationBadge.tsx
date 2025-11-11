import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';

export const NotificationBadge = () => {
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (unreadCount === 0) return null;

  return (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
      {unreadCount}
    </span>
  );
};

