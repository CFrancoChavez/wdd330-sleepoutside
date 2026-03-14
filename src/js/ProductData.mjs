function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Bad Response");
  }
}

function getProjectRootFromDataUrl(dataUrl) {
  const { pathname } = new URL(dataUrl);
  const knownMarkers = ["/src/json/", "/json/"];

  for (const marker of knownMarkers) {
    const markerIndex = pathname.indexOf(marker);
    if (markerIndex >= 0) {
      return pathname.slice(0, markerIndex);
    }
  }

  return "";
}

function normalizeAssetPath(path, projectRoot) {
  if (!path || !path.startsWith("/")) {
    return path;
  }

  return `${projectRoot}${path}`;
}

function normalizeProductAssets(products, sourceUrl) {
  const projectRoot = getProjectRootFromDataUrl(sourceUrl);

  return products.map((product) => ({
    ...product,
    Image: normalizeAssetPath(product.Image, projectRoot),
    Brand: {
      ...product.Brand,
      LogoSrc: normalizeAssetPath(product.Brand?.LogoSrc, projectRoot),
    },
  }));
}

export default class ProductData {
  constructor(category) {
    this.category = category;
  }

  async getData() {
    // Try multiple path strategies to handle different server layouts
    const pathStrategies = [
      `./json/${this.category}.json`,      // Same directory level
      `../json/${this.category}.json`,     // One level up
      `/json/${this.category}.json`,       // Absolute from root
      `../../json/${this.category}.json`,  // Two levels up
    ];

    for (const path of pathStrategies) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          const products = await response.json();
          return normalizeProductAssets(products, response.url);
        }
      } catch (e) {
        // Continue to next strategy
      }
    }
    
    // If all paths fail, throw error with details
    throw new Error(`Bad Response: Could not load ${this.category}.json from any path: ${pathStrategies.join(', ')}`);
  }
  async findProductById(id) {
    const products = await this.getData();
    return products.find((item) => item.Id === id);
  }
}
