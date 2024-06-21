export class Helper {
  static teleQueryConvert(dataString) {
    const pairs = dataString.split("&");
    const result = {};

    pairs.forEach((pair) => {
      const [key, value] = pair.split("=");

      if (key === "user") {
        result[key] = JSON.parse(decodeURIComponent(value));
      } else if (!isNaN(value)) {
        result[key] = Number(value);
      } else if (value === "true" || value === "false") {
        result[key] = value === "true";
      } else {
        result[key] = decodeURIComponent(value);
      }
    });

    return result;
  }
}
