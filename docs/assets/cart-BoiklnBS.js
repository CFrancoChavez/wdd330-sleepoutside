import{r as l,l as i,g as u,a as p,b as m,u as _,f as c}from"./utils-Doi09Ce6.js";const n=document.querySelector(".cart-list"),v=document.querySelector(".cart-empty"),o=document.querySelector(".cart-footer"),h=document.querySelector(".cart-total__amount");function y(t){const a=document.createElement("div");return a.innerHTML=t,a.textContent.trim()}function f(t){const a=y(t.DescriptionHtmlSimple),e=window.location.pathname.includes("/cart/")?`../product_pages/?product=${t.Id}`:`./product_pages/?product=${t.Id}`;return`<li class="cart-card divider">
    <a href="${e}" class="cart-card__image">
      <img src="${t.Image}" alt="${t.Name}" />
    </a>
    <div class="cart-card__details">
      <a href="${e}" class="cart-card__name-link">
        <h3 class="card__name">${t.NameWithoutBrand}</h3>
      </a>
      <p class="cart-card__brand">${t.Brand.Name}</p>
      <p class="cart-card__description">${a}</p>
      <p class="cart-card__color">Color: ${t.Colors[0].ColorName}</p>
    </div>
    <div class="cart-card__pricing">
      <p class="cart-card__price-each">${c(t.FinalPrice)} each</p>
      <p class="cart-card__quantity-display">Qty: ${t.quantity}</p>
      <p class="cart-card__price">${c(t.lineTotal)}</p>
    </div>
    <button class="cart-card__remove" type="button" data-id="${t.Id}" aria-label="Remove ${t.NameWithoutBrand} from cart">Remove</button>
  </li>`}function $(t){const a=t.reduce((r,d)=>r+d.lineTotal,0);h.textContent=c(a),o.hidden=t.length===0,v.hidden=t.length!==0;const e=o?.querySelector("a.button-link");e&&(t.length===0?(e.classList.add("disabled"),e.style.cursor="not-allowed",e.setAttribute("aria-disabled","true"),e.addEventListener("click",r=>r.preventDefault(),!0)):(e.classList.remove("disabled"),e.style.cursor="pointer",e.removeAttribute("aria-disabled")))}async function s(){const t=u(),a=p(t);m(f,n,a,"afterbegin",!0),$(a),_()}n.addEventListener("click",t=>{const a=t.target.closest(".cart-card__remove");a&&(l(a.dataset.id),s())});await i();s();
