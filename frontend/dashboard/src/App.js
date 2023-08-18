// IMPORTS
import React, { useEffect, useContext } from "react";
import { DataProvider } from "common/DataContext";
import { InteractionProvider } from "common/InteractionContext";
// import { PrivateRoute } from "common/PrivateRoute";
import { AuthContext } from "common/AuthContext";
import { Login } from "components/Login";
import { AdminDash } from "components/AdminDash";
import { PageNotFound } from "components/PageNotFound";
// import { NotificationCenter } from "components/NotificationCenter";
import { HotkeysTable } from "components/Hotkeys";
import { UserDashboard } from "components/UserDashboard";
import { LandingPage } from "components/landingPage/LandingPage";
import { Users } from "components/AdminUsers";
import { AccountPage } from "components/Account";
import { Company } from "components/AdminCompany";
import { Software } from "components/Software";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RegisterUser } from "components/RegisterUser";

// APP DECLARATION
function App() {
  const { refresh, user } = useContext(AuthContext);

  //INITIAL USE EFFECT
  useEffect(() => {
    //JWT REFRESH INTERVAL SETUP
    // if (user) refresh();
    const interval = setInterval(() => {
      refresh();
    }, 1170000);
    return () => clearInterval(interval);
    //eslint-disable-next-line
  }, []);

  // COMPONENT RENDER - APP PAGE ROUTER
  return (
    <>
      <Router>
        <InteractionProvider>
          <DataProvider>

            <Routes>
              <Route exact={true} path="/" element={<LandingPage/>} />
              <Route path="/login" element={<Login/>} />
              <Route path="/software" element={<Software/>} />
              <Route path="/account" element={<AccountPage/>} />
              <Route path="/registerUser" element={<RegisterUser/>} />
              <Route exact={true} path="/hotkeys" element={<HotkeysTable/>} />
              <Route path="/dashboard" element={<UserDashboard/>} />
              <Route path="/admindash" element={<AdminDash/>} /> 
              <Route path="users" element={<Users/>} />
              <Route path="company" element={<Company/>} />
              <Route path="*" element={<PageNotFound/>} />

            </Routes>
          </DataProvider>
        </InteractionProvider>
      </Router>
    </>
  );
}

export default App;


