function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Bad Response");
  }
}

export default class ProductData {
  constructor(category) {
    this.category = category;
    // Calculate path depth: check if we're in a nested directory by counting path segments
    // /product_pages/ has segments ["", "product_pages", ""], 2 non-empty = nested
    const allSegments = window.location.pathname.split('/');
    const nonEmptySegments = allSegments.filter(s => s);
    // If there are path segments beyond root, we're nested
    const isNestedPage = nonEmptySegments.length > 0 && !window.location.pathname.endsWith('.html');
    this.path = isNestedPage ? `../json/${this.category}.json` : `./json/${this.category}.json`;
  }
  getData() {
    return fetch(this.path)
      .then(convertToJson)
      .then((data) => data);
  }
  async findProductById(id) {
    const products = await this.getData();
    return products.find((item) => item.Id === id);
  }
}
