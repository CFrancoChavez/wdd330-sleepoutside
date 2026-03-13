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
  cart.push(product);
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

export function groupCartItems(cartItems) {
  return cartItems.reduce((groups, item) => {
    const existingItem = groups.find((group) => group.Id === item.Id);

    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.lineTotal += Number(item.FinalPrice);
      return groups;
    }

    groups.push({
      ...item,
      quantity: 1,
      lineTotal: Number(item.FinalPrice),
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
