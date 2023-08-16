import React, { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthContext } from "common/AuthContext";

export const PrivateRoute = ({ children, role, admin, ...rest }) => {
  const { user } = useContext(AuthContext);
  const loggedIn = () => user;

  return (
    <Routes>
      <Route
        {...rest}
        element={
          loggedIn() && (admin ? user.role === "admin" : true) ? (
            children
          ) : (
            <Navigate to={loggedIn() ? "/dashboard" : "/login"} replace />
          )
        }
      />
    </Routes>
  );
};
