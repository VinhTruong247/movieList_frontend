const movieCache = {
  data: {},
  timestamp: {},
  maxAge: 5 * 60 * 1000,

  get(id) {
    const now = Date.now();
    if (this.data[id] && now - this.timestamp[id] < this.maxAge) {
      return this.data[id];
    }
    return null;
  },

  set(id, data) {
    this.data[id] = data;
    this.timestamp[id] = Date.now();
  },
};

export default movieCache;
