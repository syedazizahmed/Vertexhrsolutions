const BOT_REGEX =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|TelegramBot|LinkedInBot|Slackbot|Discordbot|Pinterest|redditbot|Applebot|Googlebot|bingbot/i;

export const isBot = (userAgent = '') => BOT_REGEX.test(userAgent);
