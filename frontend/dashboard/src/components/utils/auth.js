import axios from "network";
import Cookie from "js-cookie";

export function logout() {
  axios
    .post("/api/auth/logout")
    .then(() => {
      localStorage.removeItem("user");
      window.location.replace("/");
    })
    .catch(() => {
      // some day this could be prettier? but not often used.
      // eslint-disable-next-line no-alert
      alert(
        "There was an error logging out. You should try refreshing the page and logging out again."
      );
    });
}

export function getUser() {
  return JSON.parse(localStorage.getItem("user"));
}

export function setUser(userJson) {
  localStorage.setItem("user", JSON.stringify(userJson));
}

export function userIsLoggedIn() {
  return getUser() != null;
}

export const refreshAuth = () => {
  fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
    headers: { "X-CSRF-TOKEN": Cookie.get("csrf_access_token") },
  })
    .then((response) => {
      if (!response.ok) throw new Error(response);
      return response;
    })
    .catch(() => {
      logout();
    })
    .then(() => {
      // refresh went well
    });
};