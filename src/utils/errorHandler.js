// Utility functions để xử lý lỗi trong ứng dụng CVRP

export const ErrorTypes = {
  ROUTING_ERROR: "ROUTING_ERROR",
  MAP_ERROR: "MAP_ERROR",
  COORDINATE_ERROR: "COORDINATE_ERROR",
  API_ERROR: "API_ERROR",
};

export const ErrorMessages = {
  [ErrorTypes.ROUTING_ERROR]: "Lỗi khi tính toán đường đi",
  [ErrorTypes.MAP_ERROR]: "Lỗi khi hiển thị bản đồ",
  [ErrorTypes.COORDINATE_ERROR]: "Tọa độ không hợp lệ",
  [ErrorTypes.API_ERROR]: "Lỗi kết nối API",
};

export const handleError = (error, type = ErrorTypes.MAP_ERROR) => {
  console.error(`[${type}]`, error);

  return {
    type,
    message: ErrorMessages[type],
    details: error.message || error.toString(),
    timestamp: new Date().toISOString(),
  };
};

export const validateCoordinates = (lat, lng) => {
  if (typeof lat !== "number" || typeof lng !== "number") {
    return { valid: false, error: "Tọa độ phải là số" };
  }

  if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
    return { valid: false, error: "Tọa độ không hợp lệ (NaN hoặc Infinity)" };
  }

  if (lat < -90 || lat > 90) {
    return { valid: false, error: "Vĩ độ phải trong khoảng -90 đến 90" };
  }

  if (lng < -180 || lng > 180) {
    return { valid: false, error: "Kinh độ phải trong khoảng -180 đến 180" };
  }

  return { valid: true };
};

export const validateRouteData = (routes, locations) => {
  const errors = [];

  if (!Array.isArray(routes)) {
    errors.push("Routes phải là mảng");
  }

  if (!Array.isArray(locations)) {
    errors.push("Locations phải là mảng");
  }

  if (routes && locations) {
    routes.forEach((route, routeIndex) => {
      if (!Array.isArray(route)) {
        errors.push(`Route ${routeIndex} phải là mảng`);
        return;
      }

      route.forEach((nodeIndex, pointIndex) => {
        if (
          typeof nodeIndex !== "number" ||
          nodeIndex < 0 ||
          nodeIndex >= locations.length
        ) {
          errors.push(
            `Route ${routeIndex}, điểm ${pointIndex}: node index không hợp lệ`
          );
        }
      });
    });

    locations.forEach((location, index) => {
      if (!Array.isArray(location) || location.length !== 2) {
        errors.push(`Location ${index} phải là mảng có 2 phần tử [lat, lng]`);
        return;
      }

      const [lat, lng] = location;
      const coordValidation = validateCoordinates(lat, lng);
      if (!coordValidation.valid) {
        errors.push(`Location ${index}: ${coordValidation.error}`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const createErrorNotification = (error) => {
  return {
    id: Date.now(),
    type: "error",
    title: "Lỗi",
    message: error.message || error.toString(),
    timestamp: new Date().toISOString(),
    dismissible: true,
  };
};

export const createWarningNotification = (message) => {
  return {
    id: Date.now(),
    type: "warning",
    title: "Cảnh báo",
    message,
    timestamp: new Date().toISOString(),
    dismissible: true,
  };
};
