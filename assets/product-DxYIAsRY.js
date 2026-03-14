import{i as r,u as d,c as i,f as a,d as c}from"./utils-DaEhgqgf.js";import{P as o}from"./ProductData-ckpWzqDt.js";class s{constructor(t,e){this.productId=t,this.product={},this.dataSource=e,this.feedbackTimeout=null}async init(){if(this.product=await this.dataSource.findProductById(this.productId),!this.product){this.renderMissingProduct();return}if(!await r(this.product.Image)){this.renderMissingProduct();return}this.renderProductDetails(),d(),document.getElementById("addToCart").addEventListener("click",this.addProductToCart.bind(this))}addProductToCart(){i(this.product),d(),this.showAddedToCartFeedback()}showAddedToCartFeedback(){let t=document.querySelector(".cart-feedback");t||(t=document.createElement("div"),t.className="cart-feedback",t.setAttribute("role","status"),t.setAttribute("aria-live","polite"),document.body.append(t)),t.textContent=`${this.product.NameWithoutBrand} added to cart.`,t.classList.add("cart-feedback--visible"),window.clearTimeout(this.feedbackTimeout),this.feedbackTimeout=window.setTimeout(()=>{t.classList.remove("cart-feedback--visible")},2e3)}renderProductDetails(){const t=document.querySelector(".product-detail"),e=this.product.FinalPrice<this.product.SuggestedRetailPrice;t.innerHTML=`
      <h3>${this.product.Brand.Name}</h3>
      <h2 class="divider">${this.product.NameWithoutBrand}</h2>
      ${e?'<span class="product-card__discount">Sale</span>':""}
      <img
        class="divider"
        src="${this.product.Image}"
        alt="${this.product.Name}"
      />
      <p class="product-card__price">${a(this.product.FinalPrice)}</p>
      <p class="product__color">${this.product.Colors[0].ColorName}</p>
      <p class="product__description">${this.product.DescriptionHtmlSimple}</p>
      <div class="product-detail__add">
        <button id="addToCart" data-id="${this.product.Id}">Add to Cart</button>
      </div>
    `}renderMissingProduct(){const t=document.querySelector(".product-detail");t.innerHTML=`
      <h2 class="divider">Product unavailable</h2>
      <p>This product cannot be shown because its image is missing.</p>
      <p><a href="/index.html">Return to products</a></p>
    `}}const u=c("product"),n=new o("tents"),p=new s(u,n);p.init();
