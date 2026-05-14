import { createUserNotification } from '../models/userNotificationModel.js';

export async function notifyUser(
  { userId, notificationType, title, message, linkUrl = null, metadata = null },
  { conn } = {},
) {
  const metadataJson = metadata ? JSON.stringify(metadata) : null;
  return createUserNotification(
    { userId, notificationType, title, message, linkUrl, metadataJson },
    { conn },
  );
}

