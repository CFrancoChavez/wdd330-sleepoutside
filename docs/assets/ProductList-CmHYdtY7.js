import{i as r,b as n}from"./utils-Doi09Ce6.js";function c(){const e=new URL(import.meta.url).pathname,i=["/src/js/ProductList.mjs","/js/ProductList.mjs","/assets/"];for(const a of i){const s=e.indexOf(a);if(s>=0)return e.slice(0,s)}return""}function l(e){const i=e.FinalPrice<e.SuggestedRetailPrice;return`<li class="product-card">
    <a href="${`${c()}/product_pages/index.html?product=${e.Id}`}">
      <img src="${e.Image}" alt="${e.Name}">
      ${i?'<span class="product-card__discount">Sale</span>':""}
      <h3 class="card__brand">${e.Brand.Name}</h3>
      <h2 class="card__name">${e.NameWithoutBrand}</h2>
      <p class="product-card__price">$${e.FinalPrice}</p>
    </a>
  </li>`}class d{constructor(i,a,s,t=null){this.category=i,this.dataSource=a,this.listElement=s,this.limit=t,this.allProducts=[],this.isExpanded=!1}async init(){const i=await this.dataSource.getData(),s=(await Promise.all(i.map(async t=>({product:t,hasImage:await r(t.Image)})))).filter(t=>t.hasImage).map(t=>t.product);this.allProducts=s,this.renderList(s)}renderList(i){const a=this.limit&&!this.isExpanded?i.slice(0,this.limit):i;n(l,this.listElement,a,"afterbegin",!0);const s=this.listElement.parentElement?.querySelector(".more-products-btn");if(s&&s.remove(),this.limit&&this.allProducts.length>this.limit&&!this.isExpanded){const t=document.createElement("button");t.className="more-products-btn",t.textContent="More Products",t.addEventListener("click",()=>{this.isExpanded=!0,this.renderList(this.allProducts)}),this.listElement.parentElement.appendChild(t)}}}export{d as P};
