function convertToJson(response) {
  if (!response.ok) {
    throw new Error("Bad Response");
  }
  return response.json();
}

export default class Alert {
  constructor(path = "/json/alerts.json") {
    this.path = path;
  }

  async getAlerts() {
    const data = await fetch(this.path).then(convertToJson);
    return Array.isArray(data) ? data : [];
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
