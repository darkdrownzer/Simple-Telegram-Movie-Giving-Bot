let url = Webhook.getGlobalUrl("cleanup", {
  expiresIn: 31536000
});

Bot.sendMessage(
  "🔗 Cleanup webhook:\n\n" + url
);