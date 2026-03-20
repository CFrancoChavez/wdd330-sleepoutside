import{l as P,g as S,f as n,u as _}from"./utils-CvZIbBQW.js";import{P as q}from"./ProductData-DNMUPkWy.js";await P();const d=S(),a=document.querySelector("#checkout-items"),m=document.querySelector("#checkout-total"),s=document.querySelector("#place-order");if(!d||d.length===0)a&&(a.innerHTML="<p>Your cart is empty. Add items before checking out.</p>"),s&&(s.disabled=!0);else{const t=new q("tents");let r=0;const y=d.map(async e=>{try{const c=await t.findProductById(e.Id);if(!c)return null;const o=Number(e.FinalPrice||e.SuggestedRetailPrice||0),l=Number(e.quantity||1),u=o*l;r+=u;const i=document.createElement("li");return i.className="cart-card",i.innerHTML=`
        <img class="cart-card__image" src="${c.Image}" alt="${c.Name}" />
        <div>
          <h3>${c.Brand?.Name||"Unknown Brand"}</h3>
          <p>${c.NameWithoutBrand||c.Name}</p>
          ${c.Colors&&c.Colors[0]?`<p class="product__color">${c.Colors[0].ColorName}</p>`:""}
          <p>Qty: ${l}</p>
        </div>
        <div class="cart-card__pricing">
          <span class="cart-card__price-each">${n(o)} each</span>
          <span class="cart-card__price">${n(u)}</span>
        </div>
      `,i}catch(c){console.error(`Error loading product ${e.Id}:`,c);const o=document.createElement("li");return o.className="cart-card",o.innerHTML=`
        <div>
          <h3>Product</h3>
          <p>${e.NameWithoutBrand||e.Name||"Unknown Product"}</p>
        </div>
        <div class="cart-card__pricing">
          <span class="cart-card__price-each">${n(e.FinalPrice||e.SuggestedRetailPrice||0)} each</span>
          <span class="cart-card__price">${n((e.FinalPrice||e.SuggestedRetailPrice||0)*(e.quantity||1))}</span>
          <span>Qty: ${e.quantity||1}</span>
        </div>
      `,r+=Number(e.FinalPrice||e.SuggestedRetailPrice||0)*Number(e.quantity||1),o}}),g=(await Promise.all(y)).filter(e=>e!==null);a&&g.forEach(e=>a.appendChild(e)),m&&(m.textContent=n(r))}s&&s.addEventListener("click",()=>{const t=document.querySelector("#confirm-order-modal");t&&(t.hidden=!1)});const f=document.querySelector("#confirm-checkout-btn");f&&f.addEventListener("click",()=>{localStorage.removeItem("so-cart"),_();const t=document.querySelector("#confirm-order-modal");t&&(t.hidden=!0);const r=document.querySelector("#success-order-modal");r&&(r.hidden=!1)});const p=document.querySelector("#continue-from-confirm-btn");p&&p.addEventListener("click",()=>{const t=document.querySelector("#confirm-order-modal");t&&(t.hidden=!0)});const h=document.querySelector("#continue-from-success-btn");h&&h.addEventListener("click",()=>{window.location.href="../cart/"});
