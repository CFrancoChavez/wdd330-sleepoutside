import{i as r,r as c,u as n}from"./utils-DaEhgqgf.js";import{P as l}from"./ProductData-ckpWzqDt.js";function o(t){const a=t.FinalPrice<t.SuggestedRetailPrice;return`<li class="product-card">
    <a href="product_pages/?product=${t.Id}">
      <img src="${t.Image}" alt="${t.Name}">
      ${a?'<span class="product-card__discount">Sale</span>':""}
      <h3 class="card__brand">${t.Brand.Name}</h3>
      <h2 class="card__name">${t.NameWithoutBrand}</h2>
      <p class="product-card__price">$${t.FinalPrice}</p>
    </a>
  </li>`}class d{constructor(a,i,s){this.category=a,this.dataSource=i,this.listElement=s}async init(){const a=await this.dataSource.getData(),s=(await Promise.all(a.map(async e=>({product:e,hasImage:await r(e.Image)})))).filter(e=>e.hasImage).map(e=>e.product);this.renderList(s)}renderList(a){c(o,this.listElement,a,"afterbegin",!0)}}const m=new l("tents"),u=document.querySelector(".product-list"),h=new d("tents",m,u);h.init();n();
