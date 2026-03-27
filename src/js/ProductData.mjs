function getBaseURL() {
  // Handle cases where import.meta.env is not available
  if (import.meta?.env?.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL;
  }
  // Fallback for development/testing
  console.warn('VITE_SERVER_URL not configured. Using fallback.');
  return 'https://wdd330-backend.onrender.com/';
}

function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Bad Response");
  }
}

function normalizeProductImages(product) {
  // API returns images in different structure: Images.PrimaryMedium and Images.PrimaryLarge
  // Map to simple Image property for compatibility with existing code
  if (product.Images?.PrimaryMedium) {
    product.Image = product.Images.PrimaryMedium;
  }
  if (product.Images?.PrimaryLarge) {
    product.ImageLarge = product.Images.PrimaryLarge;
  }
  return product;
}

export default class ProductData {
  constructor(category) {
    this.category = category;
  }

  async getData() {
    try {
      const baseURL = getBaseURL();
      const response = await fetch(
        `${baseURL}products/search/${this.category}`
      );
      const data = await convertToJson(response);
      
      // API returns products in data.Result
      const products = data.Result || [];
      
      // Normalize image paths for new API structure
      return products.map(normalizeProductImages);
    } catch (e) {
      console.error(`Error loading products for category ${this.category}:`, e);
      throw new Error(`Bad Response: Could not load products for ${this.category}`);
    }
  }

  async findProductById(id) {
    try {
      const baseURL = getBaseURL();
      const response = await fetch(`${baseURL}product/${id}`);
      const data = await convertToJson(response);
      
      // API returns single product in data.Result
      const product = data.Result;
      
      if (!product) {
        throw new Error("Product not found");
      }
      
      return normalizeProductImages(product);
    } catch (e) {
      console.error(`Error loading product ${id}:`, e);
      throw new Error(`Bad Response: Could not load product ${id}`);
    }
  }
}
