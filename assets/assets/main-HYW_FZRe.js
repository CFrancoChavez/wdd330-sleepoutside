import{i as r,r as i,u as c}from"./utils-CKV632yh.js";import{P as o}from"./ProductData-ckpWzqDt.js";function l(e){const t=e.FinalPrice<e.SuggestedRetailPrice;return`<li class="product-card">
    <a href="product_pages/?product=${e.Id}">
      <img src="${e.Image}" alt="${e.Name}">
      ${t?'<span class="product-card__discount">Sale</span>':""}
      <h3 class="card__brand">${e.Brand.Name}</h3>
      <h2 class="card__name">${e.NameWithoutBrand}</h2>
      <p class="product-card__price">$${e.FinalPrice}</p>
    </a>
  </li>`}class d{constructor(t,n,s){this.category=t,this.dataSource=n,this.listElement=s}async init(){const t=await this.dataSource.getData(),s=(await Promise.all(t.map(async a=>({product:a,hasImage:await r(a.Image)})))).filter(a=>a.hasImage).map(a=>a.product);this.renderList(s)}renderList(t){i(l,this.listElement,t,"afterbegin",!0)}}function m(e){if(!e.ok)throw new Error("Bad Response");return e.json()}class u{constructor(t="/json/alerts.json"){this.path=t}async getAlerts(){const t=await fetch(this.path).then(m);return Array.isArray(t)?t:[]}buildAlertSection(t){if(!t.length)return null;const n=document.createElement("section");return n.className="alert-list",t.forEach(s=>{if(!s?.message)return;const a=document.createElement("p");a.className="alert-list__item",a.textContent=s.message,s.background&&(a.style.backgroundColor=s.background),s.color&&(a.style.color=s.color),n.appendChild(a)}),n.childElementCount?n:null}async init(){const t=document.querySelector("main");if(t)try{const n=await this.getAlerts(),s=this.buildAlertSection(n);s&&t.prepend(s)}catch(n){console.error("Unable to load alerts",n)}}}const h=new o("tents"),g=document.querySelector(".product-list"),p=new d("tents",h,g),f=new u;f.init();p.init();c();
