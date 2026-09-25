let post = update.channel_post;

if (!post) {
  return;
}

let file_id = null;
let file_name = null;
let media_type = null;

if (post.document) {
  file_id = post.document.file_id;
  file_name = post.document.file_name;
  media_type = "document";
}
else if (post.video) {
  file_id = post.video.file_id;
  media_type = "video";
}

if (!file_id) {
  return;
}

if (!file_name && post.caption) {
  file_name = post.caption;
}

if (!file_name) {
  return;
}

let search_name = file_name
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .replace(/\s+/g, " ")
  .trim();

let result = await db.bot.push("movies", {
  name: file_name,
  search_name: search_name,
  file_id: file_id,
  media_type: media_type,
  message_id: post.message_id
});

if (!result || result.ok === false) {
  Bot.inspect(result);
}