let searches = await db.bot.get("search_messages", []);

if (!Array.isArray(searches) || searches.length === 0) {
  if (typeof res !== "undefined") {
    return res.json({ ok: true, deleted: 0 });
  }

  return;
}

let now = Date.now();
let remaining = [];
let deleted = 0;

for (let item of searches) {
  if (item.expires_at > now) {
    remaining.push(item);
    continue;
  }

  let result = await Api.deleteMessage({
    chat_id: item.chat_id,
    message_id: item.message_id
  });

  if (result && result.ok !== false) {
    deleted++;
  }
}

await db.bot.set("search_messages", remaining);

if (typeof res !== "undefined") {
  return res.json({
    ok: true,
    deleted: deleted,
    remaining: remaining.length
  });
}