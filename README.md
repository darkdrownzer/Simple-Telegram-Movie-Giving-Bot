# Simple Telegram Movie Giving Bot

A simple Telegram movie/series file index and search bot for TeleBotHost (TBL).

## Features

- Automatically indexes documents and videos posted to a Telegram channel.
- Searches indexed files with the `*` command.
- Relevance-based search.
- Up to 30 results.
- 10 results per page.
- Individual movie buttons.
- **Send All** for the current page.
- Previous/Next pagination.
- Search-result menus are automatically deleted after about 5 minutes.
- Uses a TBL Global Webhook and cron job for cleanup.
- Every uploaded file is indexed independently.

## Commands / handlers

- `/start` — welcome message
- `*` — movie/series search
- `/handle_channel_post` — indexes channel uploads
- `/handle_callback_query` — movie buttons, pagination and Send All
- `cleanup` — deletes expired search-result menus
- `cleanupurl` — generates the signed cleanup Global Webhook URL
- `checkmovies` — optional admin/debug command

## Setup

1. Create a Telegram bot with BotFather.
2. Create a private Telegram channel.
3. Add the bot as an administrator with permission to manage messages.
4. Add the channel-post handler to TBL.
5. Add the search and callback handlers.
6. Add the cleanup command.
7. Run `cleanupurl` and copy the generated signed URL.
8. Add that URL to a cron service such as cron-job.org and run it every minute.
9. Post movie/series files to the channel.

No channel ID is hard-coded into the collector, so the same code can be used with separate bot/channel clones.

## Storage

Movie metadata is stored in TBL's `db.bot` database. Telegram remains the actual file storage; the database stores the Telegram file ID and searchable metadata.

## Security

Never publish:
- Telegram bot tokens
- Signed cleanup webhook URLs
- Other API keys or secrets

The files in this repository are a code template; configure your own bot, channel and cleanup webhook.

## Folder structure

```
commands/
├── start.js
├── search.js
├── handle_channel_post.js
├── handle_callback_query.js
├── cleanup.js
└── cleanupurl.js

setup/
└── cron-setup.md
```
