import React, { useContext, useState, useEffect } from "react";
import { InteractionContext } from "common/InteractionContext";
import { DataContext } from "common/DataContext";
import { AuthContext } from "common/AuthContext";
import Sidebar from "../sidebar/sidebar";
import "./styles.css";

export const Page1 = () => {
  const {} = useContext(InteractionContext);
  const {} = useContext(DataContext);
  const { sidebarOpen, handleSetSidebarState } = useContext(DataContext);
  const { refresh, user } = useContext(AuthContext);
  const handleViewSidebar = () => {
    handleSetSidebarState();
  };
  return (
    <div classname='page1'>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleViewSidebar} />
      <div>
      <h1>PAGE 1</h1>
      </div>
    </div>
  );
};
