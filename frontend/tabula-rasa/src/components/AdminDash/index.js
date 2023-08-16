
import React, { useContext, useEffect, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { DataContext } from "../../common/DataContext";
import { AuthContext } from "../../common/AuthContext";
import Sidebar from "../sidebar/sidebar";
import { Navigate } from "react-router-dom";
import "./styles.css";

export const AdminDash = () => {
  // DATA CONTEXT STATES AND FUNCTIONS //

  const { sidebarOpen, handleSetSidebarState } = useContext(DataContext);
  const { refresh, user } = useContext(AuthContext);
  // const [redirect, setRedirect] = useState(false);

  // SETS STATE OF CONTROL SIDEBAR OPEN / COLLAPSED //
  const handleViewSidebar = () => {
    handleSetSidebarState();
  };
  useEffect(() => {
    if (user) {
      refresh();
    }
    if (user === null) {
      // setRedirect(true);
    }
    if (user !== null && user.role !== "admin") {
      // setRedirect(true);
    }
    // eslint-disable-next-line
  }, []);


  return (
    <div style={{ width: "100%", float: "left" }}>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleViewSidebar} />
      <Tabs
        style={
          sidebarOpen
            ? { marginLeft: "16%", width: "83vw", textAlign: "center" }
            : { marginLeft: "1rem", width: "98vw", textAlign: "center" }
        }
      >
        <TabList>
          <Tab>Tab 1</Tab>
          <Tab>Tab 2</Tab>
          <Tab>Tab 3</Tab>
        </TabList>
        <TabPanel>
          <div>
            <strong><h1>TABULA RASA</h1></strong>
            <strong><h4>A boilerplate React & Flask app by Kaart Engineering</h4></strong>
          </div>
        </TabPanel>
          
        <TabPanel>

        </TabPanel>

        <TabPanel>

        </TabPanel>

      </Tabs>
      {/* {!redirect ? <></> : <Redirect push to="/login" />} */}
    </div>
  );
};
