import{i as u,u as a,f as r,l,c as o}from"./utils-CvZIbBQW.js";import{P as p}from"./ProductData-DNMUPkWy.js";class h{constructor(t,e){this.productId=t,this.product={},this.dataSource=e,this.feedbackTimeout=null,this.selectedQuantity=1}async init(){if(this.product=await this.dataSource.findProductById(this.productId),!this.product){this.renderMissingProduct();return}if(!await u(this.product.Image)){this.renderMissingProduct();return}this.renderProductDetails(),a(),document.getElementById("addToCart").addEventListener("click",this.addProductToCart.bind(this)),document.querySelector(".product-qty-minus")?.addEventListener("click",this.decrementQuantity.bind(this)),document.querySelector(".product-qty-plus")?.addEventListener("click",this.incrementQuantity.bind(this))}addProductToCart(){const t=JSON.parse(localStorage.getItem("so-cart")||"[]"),e=t.find(i=>i.Id===this.product.Id);if(e)e.quantity=(e.quantity||1)+this.selectedQuantity,e.lineTotal=e.lineTotal+Number(this.product.FinalPrice)*this.selectedQuantity;else{const i={...this.product,quantity:this.selectedQuantity,lineTotal:Number(this.product.FinalPrice)*this.selectedQuantity};t.push(i)}localStorage.setItem("so-cart",JSON.stringify(t)),a(),this.showAddedToCartFeedback(),this.selectedQuantity=1,this.updateQuantityDisplay()}incrementQuantity(){this.selectedQuantity+=1,this.updateQuantityDisplay()}decrementQuantity(){this.selectedQuantity>1&&(this.selectedQuantity-=1,this.updateQuantityDisplay())}updateQuantityDisplay(){const t=document.querySelector(".product-qty-display");t&&(t.textContent=this.selectedQuantity)}showAddedToCartFeedback(){let t=document.querySelector(".cart-feedback");t||(t=document.createElement("div"),t.className="cart-feedback",t.setAttribute("role","status"),t.setAttribute("aria-live","polite"),document.body.append(t)),t.textContent=`${this.product.NameWithoutBrand} added to cart.`,t.classList.add("cart-feedback--visible"),window.clearTimeout(this.feedbackTimeout),this.feedbackTimeout=window.setTimeout(()=>{t.classList.remove("cart-feedback--visible")},2e3)}renderProductDetails(){const t=document.querySelector(".product-detail"),e=this.product.FinalPrice<this.product.SuggestedRetailPrice;let i="";if(e){const n=this.product.SuggestedRetailPrice-this.product.FinalPrice;i=`${Math.round(n/this.product.SuggestedRetailPrice*100)}% OFF`}t.innerHTML=`
      <h3>${this.product.Brand?.Name||"Unknown Brand"}</h3>
      <h2 class="divider">${this.product.NameWithoutBrand||this.product.Name}</h2>
      ${e?`<span class="product-card__discount">${i}</span>`:""}
      <img
        class="divider"
        src="${this.product.Image}"
        alt="${this.product.Name}"
      />
      <p class="product-card__price">${r(this.product.FinalPrice)}</p>
      ${e?`<p class="product__original-price"><s>${r(this.product.SuggestedRetailPrice)}</s></p>`:""}
      <p class="product__color">${this.product.Colors&&this.product.Colors[0]?.ColorName||"Standard"}</p>
      <p class="product__description">${this.product.DescriptionHtmlSimple||""}</p>
      <div class="product-detail__quantity">
        <label>Quantity:</label>
        <div class="product-qty-control">
          <button class="qty-btn product-qty-minus" type="button">−</button>
          <span class="product-qty-display">${this.selectedQuantity}</span>
          <button class="qty-btn product-qty-plus" type="button">+</button>
        </div>
      </div>
      <div class="product-detail__add">
        <button id="addToCart" data-id="${this.product.Id}">Add to Cart</button>
      </div>
    `}renderMissingProduct(){const t=document.querySelector(".product-detail");t.innerHTML=`
      <h2 class="divider">Product unavailable</h2>
      <p>This product cannot be shown because its image is missing.</p>
      <p><a href="/index.html">Return to products</a></p>
    `}}await l();const m=o("product"),d=o("category")||"tents",y=new p(d),b=new h(m,y),s=document.querySelector("#breadcrumb-back");if(s&&d){s.href=`../../product_listing/index.html?category=${d}`;const c=d.split("-").map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(" ");s.textContent=c}b.init().then(()=>{const c=document.querySelector("#breadcrumb-product"),e=document.querySelector(".product-detail")?.querySelector("h2")?.textContent;c&&e&&(c.textContent=e)});
