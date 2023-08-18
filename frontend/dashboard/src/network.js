import axios from "axios";
import Cookie from "js-cookie";
import { Notify } from "notiflix";

// Add a request interceptor
axios.interceptors.request.use(
  (config) => {
    // add CSRF token to every request
    let token = "";

    if (config.url.includes("/api/auth/refresh")) {
      token = Cookie.get("csrf_refresh_token");
    } else {
      token = Cookie.get("csrf_access_token");
    }
    // eslint-disable-next-line no-param-reassign
    config.headers["X-CSRF-TOKEN"] = token;

    // Do something else before request is sent
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
axios.interceptors.response.use(
  (response) => {
    if (
      response &&
      [200, 201].includes(response.status) &&
      response.data.message
    ) {
      Notify.success(response.data.message, {
        timeout: response.data.message_duration || 2000,
      });
    }
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // if it's 401, auth is expired and we should log out.
    if (error && error.response && error.response.status === 401) {
      console.log(error.response);
      axios.post("/api/auth/logout").then(() => {
        localStorage.removeItem("user");
        window.location.replace("/");
      });

      Notify.warning("Your session has expired; please log in again.", {
        timeout: 4000,
      });
    } else if (
      error &&
      error.response &&
      [400, 405, 403].includes(error.response.status) &&
      error.response.data.message
    ) {
      Notify.failure(error.response.data.message, {
        timeout: error.response.data.message_duration || 2000,
      });
    } else if (
      error &&
      error.response &&
      error.response.status === 422 &&
      error.response.data
    ) {
      // this means some input from the user did not pass server validation.
      // open a new popup for each thing that failed to validate.
      // eslint doesn't care for this syntax, but there's nothing really wrong with it so stfu eslint
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, value] of Object.entries(error.response.data)) {
        Notify.failure(
          `${key.replace(/_/g, " ")} field: ${
            Array.isArray(value) ? value[0] : value
          }`,
          { timeout: error.response.data.message_duration || 2000 }
        );
      }
    } else {
      // something went wrong but we don't know what-- throw up a generic error.
      Notify.failure(
        "Something went wrong. Please try again in a bit or contact support to get this sorted out.",
        { timeout: 10000 }
      );
    }

    // Do something with response error
    return Promise.reject(error);
  }
);

export default axios;