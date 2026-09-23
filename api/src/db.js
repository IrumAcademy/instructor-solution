function db(database) {
  function prepare(sql) {
    const stmt = database.prepare(sql);
    return {
      get: async (...params) => (await stmt.bind(...params).first()) ?? null,
      all: async (...params) => (await stmt.bind(...params).all()).results,
      run: async (...params) => {
        const result = await stmt.bind(...params).run();
        return { lastInsertRowid: result.meta.last_row_id, changes: result.meta.changes };
      },
    };
  }
  return { prepare };
}

module.exports = { db };
