import {
  a as d,
  g as l,
  i,
  s as m,
  b as u,
  r as p,
  u as _,
  f as n,
} from "./utils-CKV632yh.js";
const o = document.querySelector(".cart-list"),
  g = document.querySelector(".cart-empty"),
  h = document.querySelector(".cart-footer"),
  f = document.querySelector(".cart-total__amount");
function v(t) {
  const a = document.createElement("div");
  return (a.innerHTML = t), a.textContent.trim();
}
function C(t) {
  const a = v(t.DescriptionHtmlSimple),
    e = window.location.pathname.includes("/cart/")
      ? `../product_pages/?product=${t.Id}`
      : `./product_pages/?product=${t.Id}`;
  return `<li class="cart-card divider">
    <button class="cart-card__remove" type="button" data-id="${t.Id}" aria-label="Remove ${t.NameWithoutBrand} from cart">Remove</button>
    <a href="${e}" class="cart-card__image">
      <img src="${t.Image}" alt="${t.Name}" />
    </a>
    <div class="cart-card__details">
      <p class="cart-card__brand">${t.Brand.Name}</p>
      <a href="${e}" class="cart-card__name-link">
        <h3 class="card__name">${t.NameWithoutBrand}</h3>
      </a>
      <p class="cart-card__description">${a}</p>
      <p class="cart-card__color">Color: ${t.Colors[0].ColorName}</p>
      <p class="cart-card__quantity">Quantity: ${t.quantity}</p>
    </div>
    <div class="cart-card__pricing">
      <p class="cart-card__price-each">${n(t.FinalPrice)} each</p>
      <p class="cart-card__price">${n(t.lineTotal)}</p>
    </div>
  </li>`;
}
function $(t) {
  const a = t.reduce((e, c) => e + c.lineTotal, 0);
  (f.textContent = n(a)),
    (h.hidden = t.length === 0),
    (g.hidden = t.length !== 0);
}
async function s() {
  const t = l(),
    e = (
      await Promise.all(
        t.map(async (r) => ({ item: r, hasImage: await i(r.Image) })),
      )
    )
      .filter((r) => r.hasImage)
      .map((r) => r.item);
  e.length !== t.length && m("so-cart", e);
  const c = u(e);
  p(C, o, c, "afterbegin", !0), $(c), _();
}
o.addEventListener("click", (t) => {
  const a = t.target.closest(".cart-card__remove");
  a && (d(a.dataset.id), s());
});
s();
