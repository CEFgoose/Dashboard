import React, { useContext, useState, useEffect } from "react";
import { InteractionContext } from "common/InteractionContext";
import { DataContext } from "common/DataContext";
import { AuthContext } from "common/AuthContext";
import Sidebar from "../sidebar/sidebar";
import "./styles.css";

export const Page2 = () => {
  const {} = useContext(InteractionContext);
  const {} = useContext(DataContext);
  const { sidebarOpen, handleSetSidebarState } = useContext(DataContext);
  const { refresh, user } = useContext(AuthContext);
  const handleViewSidebar = () => {
    handleSetSidebarState();
  };
  return (
    <div classname='page2'>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleViewSidebar} />
      <div>
      <h1>PAGE 2</h1>
      </div>
    </div>
  );
};