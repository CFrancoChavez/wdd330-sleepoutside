const I =
  "data:application/json;base64,Ww0KICB7DQogICAgIm1lc3NhZ2UiOiAiU3ByaW5nIGNhbXAga2lja29mZjogMjAlIG9mZiBhbGwgdGVudHMgdGhpcyB3ZWVrZW5kLiIsDQogICAgImJhY2tncm91bmQiOiAiIzEyMzU1YiIsDQogICAgImNvbG9yIjogIiNmZmZmZmYiDQogIH0sDQogIHsNCiAgICAibWVzc2FnZSI6ICJGcmVlIHNoaXBwaW5nIG9uIG9yZGVycyBvdmVyICQxMDAuIiwNCiAgICAiYmFja2dyb3VuZCI6ICIjZjBhODY4IiwNCiAgICAiY29sb3IiOiAiIzFmMWYxZiINCiAgfQ0KXQ0K";
function s(i) {
  if (i.ok) return i.json();
  throw new Error("Bad Response");
}
class n {
  constructor(t) {
    (this.category = t),
      (this.path = new URL(
        Object.assign({ "../json/alerts.json": I })[
          `../json/${this.category}.json`
        ],
        import.meta.url,
      ).href);
  }
  getData() {
    return fetch(this.path)
      .then(s)
      .then((t) => t);
  }
  async findProductById(t) {
    return (await this.getData()).find((o) => o.Id === t);
  }
}
export { n as P };
