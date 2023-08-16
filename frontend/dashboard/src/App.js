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
import { Page1 } from "components/Page1";
import { Page2 } from "components/Page2";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
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

  const Private = ({ Component }) => {
    const auth = user.role === "admin" || user.role === "validator";
    return auth ? <Component /> : <Navigate to="/login" />;
  };




  // COMPONENT RENDER - APP PAGE ROUTER
  return (
    <>
      <Router>
        <InteractionProvider>
          <DataProvider>

            <Routes>

              {/* <Route exact={true} path="/landing" element={<LandingPage/>} /> */}
{/* 
              <Route path="/login">
                <Login />
              </Route> */}

              <Route  path="/login" element={<Login/>} />

              <Route exact={true} path="/" element={<LandingPage/>} />

              <Route path="/dashboard" element={<UserDashboard />} />
              
              {/* 
              <PrivateRoute path="/dashboard">
                <UserDashboard />
              </PrivateRoute> */}

              <Route path="/admindash" element={<AdminDash />} /> 


              {/* <PrivateRoute path="/admindash" admin>
                <AdminDash />
              </PrivateRoute> */}


              <Route path="/page1" element={<Page1 />} /> 



              {/* <PrivateRoute path="/page1" admin>
              <Page1 />
              </PrivateRoute> */}
              <Route path="/page2" element={<Page2 />} /> 
              {/* <PrivateRoute path="/page2" admin>
                <Page2 />
              </PrivateRoute> */}

              <Route path="/registerUser" element={<RegisterUser />} /> 


              {/* <Route path="/registerUser">
                <RegisterUser />
              </Route> */}

              <Route exact={true} path="/hotkeys" component={HotkeysTable} />

              <Route component={PageNotFound} />

            </Routes>
          </DataProvider>
        </InteractionProvider>
      </Router>
    </>
  );
}

export default App;


