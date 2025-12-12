'use client';

import { usePushNotifications } from '@/hooks/use-push-notifications';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';

export function PushNotificationToggle() {
    const { isSupported, isSubscribed, subscribeToPush, unsubscribeFromPush } =
        usePushNotifications();

    if (!isSupported) {
        return null;
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
        >
            {isSubscribed ? (
                <>
                    <BellOff className="h-4 w-4 mr-2" />
                    Disable Notifications
                </>
            ) : (
                <>
                    <Bell className="h-4 w-4 mr-2" />
                    Enable Notifications
                </>
            )}
        </Button>
    );
}