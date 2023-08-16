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
  const [redirect, setRedirect] = useState(false);

  // SETS STATE OF CONTROL SIDEBAR OPEN / COLLAPSED //
  const handleViewSidebar = () => {
    handleSetSidebarState();
  };

  useEffect(() => {
    if (user) {
      refresh();
    }
    if (user === null) {
      setRedirect(true);
    }
    if (user !== null && user.role !== "admin") {
      setRedirect(true);
    }
    // eslint-disable-next-line
  }, []); 

  return (
    <div style={{ width: "100%", float: "left" }}>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleViewSidebar} />
      <Tabs
        style={{
          textAlign: "center"
        }
         
        }
      >
        <div>
          <h1 style={{ paddingTop: "5vh" }}>
            <strong>Dashboard</strong>
          </h1>
        </div>
        <TabList>
          <Tab>Tab 1</Tab>
          <Tab>Tab 2</Tab>
          <Tab>Tab 3</Tab>
        </TabList>
        <TabPanel></TabPanel>

        <TabPanel></TabPanel>

        <TabPanel></TabPanel>
      </Tabs>
      {!redirect ? <></> : <Navigate push to="/login" />}
    </div>
  );
};
