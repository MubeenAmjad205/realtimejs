export const DEFAULT_UI_CONFIG = {
  DEFAULT_REACTION_EMOJIS: ['👍', '❤️', '😂', '😮', '😢', '🙏'],
  READ_RECEIPT_THRESHOLD: 0.5,
  PAGINATION_LIMIT: 20,
  TIME_FORMAT: { hour: '2-digit', minute: '2-digit' } as const,
  EMPTY_STATE_MESSAGE: 'No messages yet. Send a message to start!',
  EDIT_PROMPT_MESSAGE: 'Edit message:',
  DELETE_CONFIRM_MESSAGE: 'Delete message?',
  ATTACHMENT_PREVIEW_LIMIT: 5,
  HEADER_SUBTITLE: 'tap here for group info',
  HEADER_ONLINE: 'online',
};

export type UIConfig = typeof DEFAULT_UI_CONFIG;
