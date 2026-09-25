# Cleanup cron setup

The `cleanup` command is intended to run through a TBL Global Webhook.

1. In the bot, run `cleanupurl`.
2. Copy the signed webhook URL.
3. Create a cron job at cron-job.org.
4. Use the generated URL as the request URL.
5. Method: GET.
6. Run it every 1 minute.
7. Test the job and confirm an HTTP 200 response.

Keep the signed webhook URL private. If it expires, run `cleanupurl` again and replace the cron URL.