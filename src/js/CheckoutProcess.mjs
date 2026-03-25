import { getCartItems, formatCurrency } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

export default class CheckoutProcess {
  constructor() {
    this.list = getCartItems();
    this.itemTotal = 0;
    this.tax = 0;
    this.shipping = 0;
    this.orderTotal = 0;
    this.dataSource = new ExternalServices("tents");
  }

  async init() {
    // Load full product details for cart items
    await this.loadFullProductDetails();
    this.calculateItemSubTotal();
    this.calculateTax();
    this.calculateShipping();
    this.calculateOrderTotal();
  }

  async loadFullProductDetails() {
    // Enrich cart items with full product data from API
    const itemPromises = this.list.map(async (item) => {
      try {
        const fullProduct = await this.dataSource.findProductById(item.Id);
        if (fullProduct) {
          item.FinalPrice = fullProduct.FinalPrice || fullProduct.SuggestedRetailPrice;
          item.Name = fullProduct.Name;
          item.NameWithoutBrand = fullProduct.NameWithoutBrand;
          item.Brand = fullProduct.Brand;
          item.Colors = fullProduct.Colors;
          item.Image = fullProduct.Image;
        }
      } catch (e) {
        console.log(`Could not load product ${item.Id}, using stored data`);
      }
    });
    await Promise.all(itemPromises);
  }

  calculateItemSubTotal() {
    this.itemTotal = this.list.reduce((sum, item) => {
      const price = Number(item.FinalPrice || 0);
      const quantity = Number(item.quantity || 1);
      return sum + (price * quantity);
    }, 0);
  }

  calculateTax() {
    this.tax = this.itemTotal * 0.06;
  }

  calculateShipping() {
    // Base shipping $10 + $2 per additional item
    const itemCount = this.list.length;
    this.shipping = 10 + (Math.max(0, itemCount - 1) * 2);
  }

  calculateOrderTotal() {
    this.orderTotal = this.itemTotal + this.tax + this.shipping;
  }

  packageItems() {
    // Convert cart items to server format
    return this.list.map(item => ({
      id: item.Id,
      name: item.Name,
      price: Number(item.FinalPrice || 0),
      quantity: Number(item.quantity || 1)
    }));
  }

  async checkout(form) {
    // Build the order object
    const order = {
      orderDate: new Date().toISOString(),
      fname: form.fname.value,
      lname: form.lname.value,
      street: form.street.value,
      city: form.city.value,
      state: form.state.value,
      zip: form.zip.value,
      cardNumber: form.cardNumber.value,
      expiration: form.expiration.value,
      code: form.code.value,
      items: this.packageItems(),
      orderTotal: this.orderTotal,
      shipping: this.shipping,
      tax: this.tax,
      subtotal: this.itemTotal
    };

    // Send to server
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(order)
    };

    try {
      const response = await fetch(
        "https://wdd330-sleepoutside-0tyl.onrender.com/checkout",
        options
      );
      
      // Check for both network errors and server errors
      if (!response.ok) {
        const errorData = await response.json();
        throw { name: 'servicesError', message: errorData };
      }
      
      const result = await response.json();
      console.log("Server response:", result);
      return result;
    } catch (error) {
      console.error("Error sending order to server:", error);
      // Re-throw the error so it can be caught by the calling code
      throw error;
    }
  }
}
