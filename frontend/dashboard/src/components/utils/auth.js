import Cookie from "js-cookie";
import { SSO_URL } from "components/constants";

export const logout = () => {
  fetch(SSO_URL.concat("auth/logout"), {
    method: "POST",
  }).then(() => {
    setUser(null);
  });
};

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
