/**
 * Notification Settings Component
 * 
 * Allows users to manage their push notification preferences
 */

import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function NotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    toggleSubscription,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BellOff className="w-4 h-4 text-amber-600" />
            Push Notifications Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your browser doesn't support push notifications. Try using Chrome, Firefox, or Edge for the best experience.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (permission === 'denied') {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BellOff className="w-4 h-4 text-red-600" />
            Notifications Blocked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You've blocked notifications for this site. To enable them, click the lock icon in your browser's address bar and allow notifications.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#1e3a5f]" />
          Class Reminders
        </CardTitle>
        <CardDescription>
          Get notified before your classes start
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-medium">Push Notifications</h4>
            <p className="text-xs text-muted-foreground">
              Receive reminders 1 day and 1 hour before class
            </p>
          </div>
          
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : (
            <Switch 
              checked={isSubscribed}
              onCheckedChange={toggleSubscription}
              disabled={isLoading}
            />
          )}
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        {!isSubscribed && (
          <Button
            onClick={toggleSubscription}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enabling...
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Enable Class Reminders
              </>
            )}
          </Button>
        )}

        {isSubscribed && (
          <div className="text-xs text-green-600 bg-green-50 p-3 rounded flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span>You'll receive reminders 1 day and 1 hour before each class</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default NotificationSettings;
