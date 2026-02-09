import toast from "react-hot-toast";

export function showToast(type, message, options = {}) {
  if (!message) return;

  const duration = options.duration || getDefaultDuration(type);

  const config = {
    duration,
    description: options.description,
  };

  switch (type) {
    case "success":
      toast.success(message, config);
      break;

    case "error":
      toast.error(message, config);
      break;

    case "loading":
      toast.loading(message, config);
      break;

    case "info":
    default:
      toast(message, config);
      break;
  }
}

// # shortcut direct use 
export function toastSuccess(message, options = {}) {
  showToast("success", message, options);
}

export function toastError(message, options = {}) {
  showToast("error", message, options);
}

export function toastInfo(message, options = {}) {
  showToast("info", message, options);
}

export function toastLoading(message, options = {}) {
  showToast("loading", message, options);
}

// def durations
function getDefaultDuration(type) {
  switch (type) {
    case "success":
      return 2500;
    case "error":
      return 4000;
    case "loading":
      return 3000;
    default:
      return 3000;
  }
}
