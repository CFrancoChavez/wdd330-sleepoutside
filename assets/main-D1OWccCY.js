import { i as n, r, u as c } from "./utils-CKV632yh.js";
import { P as o } from "./ProductData-RnQMcRd8.js";
function l(e) {
  const t = e.FinalPrice < e.SuggestedRetailPrice;
  return `<li class="product-card">
    <a href="product_pages/?product=${e.Id}">
      <img src="${e.Image}" alt="${e.Name}">
      ${t ? '<span class="product-card__discount">Sale</span>' : ""}
      <h3 class="card__brand">${e.Brand.Name}</h3>
      <h2 class="card__name">${e.NameWithoutBrand}</h2>
      <p class="product-card__price">$${e.FinalPrice}</p>
    </a>
  </li>`;
}
class m {
  constructor(t, s, i) {
    (this.category = t), (this.dataSource = s), (this.listElement = i);
  }
  async init() {
    const t = await this.dataSource.getData(),
      i = (
        await Promise.all(
          t.map(async (a) => ({ product: a, hasImage: await n(a.Image) })),
        )
      )
        .filter((a) => a.hasImage)
        .map((a) => a.product);
    this.renderList(i);
  }
  renderList(t) {
    r(l, this.listElement, t, "afterbegin", !0);
  }
}
function d(e) {
  if (!e.ok) throw new Error("Bad Response");
  return e.json();
}
class u {
  constructor(
    t = new URL(
      "data:application/json;base64,Ww0KICB7DQogICAgIm1lc3NhZ2UiOiAiU3ByaW5nIGNhbXAga2lja29mZjogMjAlIG9mZiBhbGwgdGVudHMgdGhpcyB3ZWVrZW5kLiIsDQogICAgImJhY2tncm91bmQiOiAiIzEyMzU1YiIsDQogICAgImNvbG9yIjogIiNmZmZmZmYiDQogIH0sDQogIHsNCiAgICAibWVzc2FnZSI6ICJGcmVlIHNoaXBwaW5nIG9uIG9yZGVycyBvdmVyICQxMDAuIiwNCiAgICAiYmFja2dyb3VuZCI6ICIjZjBhODY4IiwNCiAgICAiY29sb3IiOiAiIzFmMWYxZiINCiAgfQ0KXQ0K",
      import.meta.url,
    ).href,
  ) {
    this.path = t;
  }
  async getAlerts() {
    const t = await fetch(this.path).then(d);
    return Array.isArray(t) ? t : [];
  }
  buildAlertSection(t) {
    if (!t.length) return null;
    const s = document.createElement("section");
    return (
      (s.className = "alert-list"),
      t.forEach((i) => {
        if (!i?.message) return;
        const a = document.createElement("p");
        (a.className = "alert-list__item"),
          (a.textContent = i.message),
          i.background && (a.style.backgroundColor = i.background),
          i.color && (a.style.color = i.color),
          s.appendChild(a);
      }),
      s.childElementCount ? s : null
    );
  }
  async init() {
    const t = document.querySelector("main");
    if (t)
      try {
        const s = await this.getAlerts(),
          i = this.buildAlertSection(s);
        i && t.prepend(i);
      } catch (s) {
        console.error("Unable to load alerts", s);
      }
  }
}
const g = new o("tents"),
  h = document.querySelector(".product-list"),
  I = new m("tents", g, h),
  p = new u();
p.init();
I.init();
c();
