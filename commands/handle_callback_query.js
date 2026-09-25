let data = update.callback_query.data;

if (!data) {
  return;
}

if (data.startsWith("movie_")) {
  await Api.answerCallbackQuery({
    callback_query_id: update.callback_query.id,
    text: "🎬 Sending movie..."
  });

  let message_id = data.replace("movie_", "");
  let movies = await db.bot.get("movies", []);

  let movie = movies.find(
    m => String(m.message_id) === String(message_id)
  );

  if (!movie) {
    return Bot.sendMessage("❌ Movie not found in database.");
  }

  if (movie.media_type === "video") {
    await Api.sendVideo({
      chat_id: chat.id,
      video: movie.file_id,
      caption: "🎬 " + movie.name
    });
  }
  else if (movie.media_type === "document") {
    await Api.sendDocument({
      chat_id: chat.id,
      document: movie.file_id,
      caption: "🎬 " + movie.name
    });
  }

  return;
}

if (data.startsWith("page_")) {
  await Api.answerCallbackQuery({
    callback_query_id: update.callback_query.id
  });

  let page = parseInt(data.replace("page_", ""));

  if (!page || page < 1) {
    return;
  }

  let query = await db.user.get("movie_search_query", "");

  if (!query) {
    return Bot.sendMessage(
      "❌ Search session expired. Please search again."
    );
  }

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

      return { movie: movie, score: score };
    })
    .filter(item => item !== null);

  results.sort((a, b) => b.score - a.score);
  results = results.map(item => item.movie);
  results = results.slice(0, 30);

  if (results.length === 0) {
    return Bot.sendMessage("❌ No movies found.");
  }

  let perPage = 10;
  let totalPages = Math.ceil(results.length / perPage);

  if (page > totalPages) {
    page = totalPages;
  }

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

  await Api.editMessageText({
    chat_id: chat.id,
    message_id: update.callback_query.message.message_id,
    text:
      "🔎 Results for: " + query +
      "\n\n📦 Showing " + results.length + " result(s)",
    reply_markup: {
      inline_keyboard: buttons
    }
  });

  return;
}

if (data.startsWith("all_")) {
  await Api.answerCallbackQuery({
    callback_query_id: update.callback_query.id,
    text: "📦 Sending all movies from this page..."
  });

  let page = parseInt(data.replace("all_", ""));

  if (!page || page < 1) {
    return;
  }

  let query = await db.user.get("movie_search_query", "");

  if (!query) {
    return Bot.sendMessage(
      "❌ Search session expired. Please search again."
    );
  }

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

      return { movie: movie, score: score };
    })
    .filter(item => item !== null);

  results.sort((a, b) => b.score - a.score);
  results = results.map(item => item.movie);
  results = results.slice(0, 30);

  let perPage = 10;
  let start = (page - 1) * perPage;
  let pageResults = results.slice(start, start + perPage);

  if (pageResults.length === 0) {
    return Bot.sendMessage(
      "❌ No movies found on this page."
    );
  }

  for (let movie of pageResults) {
    if (movie.media_type === "video") {
      await Api.sendVideo({
        chat_id: chat.id,
        video: movie.file_id,
        caption: "🎬 " + movie.name
      });
    }
    else if (movie.media_type === "document") {
      await Api.sendDocument({
        chat_id: chat.id,
        document: movie.file_id,
        caption: "🎬 " + movie.name
      });
    }
  }

  return;
}

if (data === "pageinfo") {
  await Api.answerCallbackQuery({
    callback_query_id: update.callback_query.id,
    text: "📄 This is the current results page."
  });

  return;
}