require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  sessionSecret: process.env.SESSION_SECRET || 'default-secret-change-me',
  admin: {
    user: process.env.ADMIN_USER || 'admin',
    pass: process.env.ADMIN_PASS || 'admin123',
  },
  bot: {
    name: process.env.BOT_NAME || 'Sprachzentrum Bot',
    welcomeMessage: process.env.WELCOME_MESSAGE || 'Willkommen beim Sprachzentrum! Wie kann ich Ihnen helfen?',
  },
  dbPath: require('path').join(__dirname, '..', 'data', 'chatbot.db'),
};
