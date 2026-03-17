function convertToJson(response) {
  if (!response.ok) {
    throw new Error("Bad Response");
  }
  return response.json();
}

export default class Alert {
  constructor(path) {
    this.customPath = path;
  }

  async getAlerts() {
    // Try multiple path strategies to handle different server layouts
    const pathStrategies = this.customPath
      ? [this.customPath]
      : [
          `./json/alerts.json`, // Same directory level
          `../json/alerts.json`, // One level up
          `/json/alerts.json`, // Absolute from root
          `../../json/alerts.json`, // Two levels up
          `src/json/alerts.json`, // Live Server from root
          `src/public/json/alerts.json`, // Live Server public folder
        ];

    for (const path of pathStrategies) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          const data = await response.json();
          return Array.isArray(data) ? data : [];
        }
      } catch (e) {
        // Continue to next strategy
      }
    }

    // If all paths fail, return empty array (no alerts is acceptable)
    return [];
  }

  buildAlertSection(alerts) {
    if (!alerts.length) {
      return null;
    }

    const section = document.createElement("section");
    section.className = "alert-list";

    alerts.forEach((alert) => {
      if (!alert?.message) {
        return;
      }

      const item = document.createElement("p");
      item.className = "alert-list__item";
      item.textContent = alert.message;
      if (alert.background) {
        item.style.backgroundColor = alert.background;
      }
      if (alert.color) {
        item.style.color = alert.color;
      }
      section.appendChild(item);
    });

    return section.childElementCount ? section : null;
  }

  async init() {
    const main = document.querySelector("main");
    if (!main) {
      return;
    }

    try {
      const alerts = await this.getAlerts();
      const section = this.buildAlertSection(alerts);
      if (section) {
        main.prepend(section);
      }
    } catch (error) {
      console.error("Unable to load alerts", error);
    }
  }
}
