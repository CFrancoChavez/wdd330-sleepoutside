// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

export function getCartItems() {
  return getLocalStorage("so-cart") || [];
}

export function addProductToCart(product) {
  const cart = getCartItems();
  
  // Check if item already exists in cart
  const existingItem = cart.find((item) => item.Id === product.Id);
  
  if (existingItem) {
    // Item exists - increment quantity and update lineTotal
    existingItem.quantity = (existingItem.quantity || 1) + 1;
    existingItem.lineTotal = (existingItem.lineTotal || Number(existingItem.FinalPrice)) + Number(product.FinalPrice);
  } else {
    // Item doesn't exist - add with quantity 1
    const newItem = {
      ...product,
      quantity: 1,
      lineTotal: Number(product.FinalPrice),
    };
    cart.push(newItem);
  }
  
  setLocalStorage("so-cart", cart);
  return cart;
}

export function removeProductFromCart(productId) {
  const cart = getCartItems();
  const itemIndex = cart.findIndex((item) => item.Id === productId);

  if (itemIndex === -1) {
    return cart;
  }

  cart.splice(itemIndex, 1);
  setLocalStorage("so-cart", cart);
  return cart;
}

export function updateProductQuantity(productId, quantity) {
  const cart = getCartItems();
  const item = cart.find((cartItem) => cartItem.Id === productId);

  if (!item) {
    return cart;
  }

  if (quantity <= 0) {
    return removeProductFromCart(productId);
  }

  item.quantity = quantity;
  item.lineTotal = (item.FinalPrice || item.SuggestedRetailPrice) * quantity;
  setLocalStorage("so-cart", cart);
  return cart;
}

export function groupCartItems(cartItems) {
  // VALIDACIÓN CRUCIAL: Si cartItems no existe o no es un array, devolvemos un array vacío
  if (!Array.isArray(cartItems)) {
    return [];
  }

  return cartItems.reduce((groups, item) => {
    const existingItem = groups.find((group) => group.Id === item.Id);

    if (existingItem) {
      existingItem.quantity += item.quantity || 1;
      existingItem.lineTotal += item.lineTotal || Number(item.FinalPrice);
      return groups;
    }

    groups.push({
      ...item,
      quantity: item.quantity || 1,
      lineTotal: item.lineTotal || Number(item.FinalPrice),
    });
    return groups;
  }, []);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function updateCartCount() {
  const count = getCartItems().length;
  const badge = document.querySelector(".cart-count");
  if (!badge) return;
  if (count === 0) {
    badge.hidden = true;
    badge.textContent = "";
  } else {
    badge.textContent = count;
    badge.hidden = false;
  }
}

export function imageExists(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = src;
  });
}

export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

export function getSiteBasePath() {
  const pathname = window.location.pathname;
  const sectionMarkers = ["/cart/", "/checkout/", "/product_listing/", "/product_pages/"];

  const markerIndex = sectionMarkers
    .map((marker) => pathname.indexOf(marker))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];

  if (typeof markerIndex === "number") {
    const prefix = pathname.slice(0, markerIndex);
    return prefix ? `${prefix}/` : "/";
  }

  const modulePathname = new URL(import.meta.url).pathname;
  const srcMarker = "/src/js/";
  const srcMarkerIndex = modulePathname.indexOf(srcMarker);
  if (
    srcMarkerIndex >= 0 &&
    (pathname === "/" || pathname.endsWith("/index.html"))
  ) {
    const prefix = modulePathname.slice(0, srcMarkerIndex);
    return `${prefix}/src/`;
  }

  if (pathname.endsWith("/")) {
    return pathname;
  }

  const lastSlash = pathname.lastIndexOf("/");
  return `${pathname.slice(0, lastSlash + 1)}`;
}

export function buildSiteUrl(path) {
  const normalizedPath = String(path || "").replace(/^\/+/, "");
  return `${getSiteBasePath()}${normalizedPath}`;
}

export function normalizeAssetUrl(assetPath) {
  const value = String(assetPath || "").trim();

  if (!value) {
    return value;
  }

  // Keep absolute and protocol-relative URLs unchanged.
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }

  if (!value.startsWith("/")) {
    return value;
  }

  const base = getSiteBasePath();
  const normalizedValue = value.replace(/^\/+/, "");

  if (
    base.includes("/src/") &&
    (normalizedValue.startsWith("images/") ||
      normalizedValue.startsWith("json/") ||
      normalizedValue.startsWith("partials/"))
  ) {
    return `${base}public/${normalizedValue}`;
  }

  return `${base}${normalizedValue}`;
}

function isSourceMode() {
  return new URL(import.meta.url).pathname.includes("/src/js/");
}

function resolveTemplatePath(path) {
  return buildSiteUrl(path);
}

function normalizeAssetPaths(container) {
  const base = getSiteBasePath();
  const nodesWithHref = container.querySelectorAll("[href]");
  const nodesWithSrc = container.querySelectorAll("[src]");

  nodesWithHref.forEach((node) => {
    const href = node.getAttribute("href");
    if (!href || !href.startsWith("/") || href.startsWith("//")) {
      return;
    }
    node.setAttribute("href", `${base}${href.replace(/^\/+/, "")}`);
  });

  nodesWithSrc.forEach((node) => {
    const src = node.getAttribute("src");
    if (!src || !src.startsWith("/") || src.startsWith("//")) {
      return;
    }

    const normalizedSrc = src.replace(/^\/+/, "");
    if (
      base.includes("/src/") &&
      (normalizedSrc.startsWith("images/") ||
        normalizedSrc.startsWith("json/") ||
        normalizedSrc.startsWith("partials/"))
    ) {
      node.setAttribute("src", `${base}public/${normalizedSrc}`);
      return;
    }

    node.setAttribute("src", `${base}${normalizedSrc}`);
  });
}

export async function loadTemplate(path) {
  const attempts = [
    resolveTemplatePath(path),
    resolveTemplatePath(`public/${path}`),
    `./src/public/${path}`,
    `/src/public/${path}`,
    `./${path}`,
    `/${path}`,
  ];

  for (const attempt of attempts) {
    try {
      const response = await fetch(attempt);
      if (response.ok) {
        return response.text();
      }
    } catch (_error) {
      // Try next location.
    }
  }

  throw new Error(`Unable to load template: ${path}`);
}

export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  normalizeAssetPaths(parentElement);

  if (callback) {
    callback(data);
  }
}

export async function loadHeaderFooter() {
  const headerElement = document.querySelector("#main-header");
  const footerElement = document.querySelector("#main-footer");

  if (!headerElement && !footerElement) {
    return;
  }

  const headerPath = isSourceMode()
    ? "public/partials/header.html"
    : "partials/header.html";
  const footerPath = isSourceMode()
    ? "public/partials/footer.html"
    : "partials/footer.html";

  const [headerTemplate, footerTemplate] = await Promise.all([
    loadTemplate(headerPath),
    loadTemplate(footerPath),
  ]);

  if (headerElement) {
    renderWithTemplate(headerTemplate, headerElement);
  }

  if (footerElement) {
    renderWithTemplate(footerTemplate, footerElement);
  }
}

export function renderListWithTemplate(
  templateFn,
  parentElement,
  list,
  position = "afterbegin",
  clear = false,
) {
  if (clear) {
    parentElement.innerHTML = "";
  }

  const htmlStrings = list.map(templateFn);
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

export function alertMessage(message, scroll = true) {
  // Create element to hold the alert
  const alert = document.createElement('div');
  // Add a class to style the alert
  alert.classList.add('alert');
  
  // Set the contents - include a message and a close button (X)
  if (typeof message === 'string') {
    alert.innerHTML = `
      <div class="alert__content">
        <p>${message}</p>
        <button type="button" class="alert__close" aria-label="Close alert">&times;</button>
      </div>
    `;
  } else {
    // Handle object messages (from server errors)
    const errorMessage = message.message ? JSON.stringify(message.message) : String(message);
    alert.innerHTML = `
      <div class="alert__content">
        <p>${errorMessage}</p>
        <button type="button" class="alert__close" aria-label="Close alert">&times;</button>
      </div>
    `;
  }
  
  // Add a listener to the alert to see if they clicked on the close button
  alert.addEventListener('click', function(e) {
    // Check if the close button was clicked
    if (e.target.classList.contains('alert__close') || e.target.tagName === 'BUTTON') {
      const main = document.querySelector('main');
      if (main && main.contains(this)) {
        main.removeChild(this);
      }
    }
  });
  
  // Add the alert to the top of main
  const main = document.querySelector('main');
  if (main) {
    main.prepend(alert);
  }
  
  // Make sure they see the alert by scrolling to the top of the window
  // You may not always want to do this, so default to scroll=true but allow it to be overridden
  if (scroll) {
    window.scrollTo(0, 0);
  }
}

