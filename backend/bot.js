import TelegramBot from 'node-telegram-bot-api';
import { dbOps } from './database.js';
import { extractMetadata } from './metadataExtractor.js';

let bot;

// URL regex pattern
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export const initBot = (token) => {
  bot = new TelegramBot(token, { polling: true });

  // Handle /start command
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      `🔗 *Link Manager Bot*\n\n` +
      `Send me any link and I'll automatically save it for you!\n\n` +
      `*Features:*\n` +
      `• Automatic title & description extraction\n` +
      `• Smart categorization\n` +
      `• Preview images\n` +
      `• Search & browse via web interface\n\n` +
      `*Commands:*\n` +
      `/start - Show this message\n` +
      `/help - Get help\n` +
      `/stats - View your link statistics`,
      { parse_mode: 'Markdown' }
    );
  });

  // Handle /help command
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      `📖 *How to use:*\n\n` +
      `1. Send any link to the bot\n` +
      `2. It will be automatically saved\n` +
      `3. Access the web interface to search and manage\n\n` +
      `*Tips:*\n` +
      `• You can send multiple links at once\n` +
      `• Links are automatically categorized\n` +
      `• Use the web interface for advanced features`,
      { parse_mode: 'Markdown' }
    );
  });

  // Handle /stats command
  bot.onText(/\/stats/, async (msg) => {
    const chatId = msg.chat.id;
    try {
      const links = dbOps.getAllLinks();
      const categories = dbOps.getCategories();

      let statsMessage = `📊 *Your Link Statistics*\n\n`;
      statsMessage += `Total Links: ${links.length}\n\n`;

      if (categories.length > 0) {
        statsMessage += `*By Category:*\n`;
        categories.forEach(cat => {
          statsMessage += `• ${cat.category}: ${cat.count}\n`;
        });
      }

      bot.sendMessage(chatId, statsMessage, { parse_mode: 'Markdown' });
    } catch (error) {
      bot.sendMessage(chatId, '❌ Error fetching statistics');
      console.error('Stats error:', error);
    }
  });

  // Handle regular messages (looking for URLs)
  bot.on('message', async (msg) => {
    // Skip if it's a command
    if (msg.text && msg.text.startsWith('/')) return;

    const chatId = msg.chat.id;
    const text = msg.text || msg.caption || '';

    // Extract URLs from message
    const urls = text.match(URL_REGEX);

    if (urls && urls.length > 0) {
      for (const url of urls) {
        try {
          // Send processing message
          const processingMsg = await bot.sendMessage(
            chatId,
            `⏳ Saving: ${url}`
          );

          // Extract metadata
          const metadata = await extractMetadata(url);

          // Save to database
          const link = dbOps.saveLink(
            url,
            metadata.title,
            metadata.description,
            metadata.imageUrl,
            metadata.category
          );

          // Delete processing message
          await bot.deleteMessage(chatId, processingMsg.message_id);

          // Send success confirmation
          let messageText = `✅ *Link Saved!*\n\n`;
          messageText += `*Title:* ${metadata.title}\n`;
          if (metadata.description) {
            messageText += `*Description:* ${metadata.description.substring(0, 150)}${metadata.description.length > 150 ? '...' : ''}\n`;
          }
          messageText += `*Category:* ${metadata.category}\n`;
          messageText += `*URL:* ${url}`;

          // Add image if available
          if (metadata.imageUrl) {
            try {
              await bot.sendPhoto(chatId, metadata.imageUrl, {
                caption: messageText,
                parse_mode: 'Markdown'
              });
            } catch (imgError) {
              // If image fails, send text only
              await bot.sendMessage(chatId, messageText, { parse_mode: 'Markdown' });
            }
          } else {
            await bot.sendMessage(chatId, messageText, { parse_mode: 'Markdown' });
          }

        } catch (error) {
          console.error('Error processing link:', error);
          bot.sendMessage(
            chatId,
            `❌ Error processing link: ${url}\n${error.message}`
          );
        }
      }
    }
  });

  console.log('Telegram bot started successfully!');
};

export { bot };
