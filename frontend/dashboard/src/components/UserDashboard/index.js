import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "common/DataContext";
import { AuthContext } from "common/AuthContext";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Sidebar from "../sidebar/sidebar";

export const UserDashboard = () => {
  // DATA CONTEXT STATES AND FUNCTIONS //
  const [redirect, setRedirect] = useState(false);
  const { refresh, user } = useContext(AuthContext);
  const { sidebarOpen, handleSetSidebarState } = useContext(DataContext);
  const { history } = useContext(DataContext);
  
  useEffect(() => {
    if (user) {
      refresh();
    }
    if (user === null) {
      setRedirect(true);
    }
    if (user !== null && user.role !== "user") {
      setRedirect(true);
    }
    // eslint-disable-next-line
  }, []);


  // SETS STATE OF CONTROL SIDEBAR OPEN / COLLAPSED //
  const handleViewSidebar = () => {
    handleSetSidebarState();
  };
  ///// COMPONENT RENDER /////
  return (
    <div style={{ width: "100%", float: "left" }}>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleViewSidebar} />
      <Tabs
        style={
          sidebarOpen
            ? { marginLeft: "16%", width: "83vw", textAlign: "center" }
            : { marginLeft: "10%", width: "88vw", textAlign: "center" }
        }
      >
        <TabList className="tabheader">
          {/* <Tab selectedClassName="activetab">Tab 1</Tab> */}

          <Tab>Tab 1</Tab>
          <Tab>Tab 2</Tab>

        </TabList>

        <TabPanel>
        {/* <Tab selectedClassName="activetab">Tab 2</Tab> */}
        </TabPanel>
      </Tabs>
      history('/login')
    </div>
  );
};
