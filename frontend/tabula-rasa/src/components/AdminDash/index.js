import React, { useContext, useEffect, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { DataContext } from "../../common/DataContext";
import { AuthContext } from "../../common/AuthContext";
import Sidebar from "../sidebar/sidebar";
import { Navigate } from "react-router-dom";
import "./styles.css";
import {
  CancelConfirmButtons,
  AddProjectModal,
  AddUserModal,
} from "components/commonComponents/commonComponents";
import useToggle from "../../hooks/useToggle.js";

export const AdminDash = () => {
  // DATA CONTEXT STATES AND FUNCTIONS //
  const { getOverpassData, getTaskManagerData, addProject } =
    useContext(DataContext);
  const { sidebarOpen, handleSetSidebarState } = useContext(DataContext);
  const { refresh, user } = useContext(AuthContext);
  const [redirect, setRedirect] = useState(false);

  const [url, setUrl] = useState(null);
  const [addProjectOpen, toggleAddProjectOpen] = useToggle(false);

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

  const handleGetOverpassData = () => {
    getOverpassData();
  };

  const handleGetTaskManagerData = () => {
    getTaskManagerData();
  };

  const handleAddProjectOpen = () => {
    toggleAddProjectOpen(!addProjectOpen);
  };

  const handleSetUrl = (e) => {
    setUrl(e.target.value);
  };

  const handleAddProject = (e) => {
    addProject(url);
    handleAddOpen();
  };

  return (
    <div style={{ width: "100%", float: "left" }}>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleViewSidebar} />
      <Tabs
        style={{
          textAlign: "center",
        }}
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
        <TabPanel>
          <div style={{ marginBottom: "3vh" }}>
            <CancelConfirmButtons
              confirm_text={"Add"}
              cancel_text={"Cancel"}
              confirm_action={handleGetOverpassData}
              // cancel_action={getOverpassData}
            />
          </div>
          <div style={{ marginBottom: "3vh" }}>
            <CancelConfirmButtons
              confirm_text={"Add"}
              cancel_text={"Cancel"}
              confirm_action={handleGetTaskManagerData}
              // cancel_action={getOverpassData}
            />
          </div>
          <div style={{ marginBottom: "3vh" }}>
            <CancelConfirmButtons
              confirm_text={"Add"}
              cancel_text={"Cancel"}
              confirm_action={handleAddProjectOpen}
              // cancel_action={getOverpassData}
            />
          </div>
          <AddProjectModal
            addOpen={addOpen}
            handleAddOpen={handleAddOpen}
            url={url}
            handleSetUrl={handleSetUrl}
            handleAddProject={handleAddProject}
          />
          <CancelConfirmButtons
            confirm_text={"Add"}
            cancel_text={"Cancel"}
            confirm_action={handleAddProjectOpen}
            // cancel_action={getOverpassData}
          />
        </TabPanel>

        <TabPanel></TabPanel>

        <TabPanel></TabPanel>
      </Tabs>

      {!redirect ? <></> : <Navigate push to="/login" />}
    </div>
  );
};
