let query = message;

if (!query || !query.trim()) {
  return Bot.sendMessage(
    "🔎 Please enter a movie or series name to search."
  );
}

query = query
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .replace(/\s+/g, " ")
  .trim();

if (!query) {
  return Bot.sendMessage(
    "🔎 Please enter a movie or series name to search."
  );
}

await db.user.set("movie_search_query", query);

let movies = await db.bot.get("movies", []);
let words = query.split(" ");

let results = movies
  .map(movie => {
    if (!movie.search_name) {
      return null;
    }

    let score = 0;

    for (let word of words) {
      if (!movie.search_name.includes(word)) {
        return null;
      }

      let movieWords = movie.search_name.split(" ");

      if (movieWords.includes(word)) {
        score += 3;
      }

      if (movie.search_name.startsWith(word)) {
        score += 2;
      }

      score += 1;
    }

    if (movie.search_name.includes(query)) {
      score += 5;
    }

    return {
      movie: movie,
      score: score
    };
  })
  .filter(item => item !== null);

results.sort((a, b) => b.score - a.score);
results = results.map(item => item.movie);
results = results.slice(0, 30);

if (results.length === 0) {
  return Bot.sendMessage(
    "❌ No movies found for:\n" + message
  );
}

let page = 1;
let perPage = 10;
let totalPages = Math.ceil(results.length / perPage);
let start = (page - 1) * perPage;
let pageResults = results.slice(start, start + perPage);

let buttons = [];

pageResults.forEach(movie => {
  buttons.push([
    {
      text: "🎬 " + movie.name,
      callback_data: "movie_" + movie.message_id
    }
  ]);
});

buttons.push([
  {
    text: "📦 Send All",
    callback_data: "all_" + page
  }
]);

let navigation = [];

if (page > 1) {
  navigation.push({
    text: "⬅️ Previous",
    callback_data: "page_" + (page - 1)
  });
}

if (page < totalPages) {
  navigation.push({
    text: "➡️ Next",
    callback_data: "page_" + (page + 1)
  });
}

if (navigation.length > 0) {
  buttons.push(navigation);
}

buttons.push([
  {
    text: "📄 Page " + page + "/" + totalPages,
    callback_data: "pageinfo"
  }
]);

let sent = await Api.sendMessage({
  chat_id: chat.id,
  text:
    "🔎 Results for: " + message +
    "\n\n📦 Showing " + results.length + " result(s)",
  reply_markup: {
    inline_keyboard: buttons
  }
});

if (sent && sent.result && sent.result.message_id) {
  await db.bot.push(
    "search_messages",
    {
      chat_id: chat.id,
      message_id: sent.result.message_id,
      expires_at: Date.now() + (5 * 60 * 1000)
    }
  );
}