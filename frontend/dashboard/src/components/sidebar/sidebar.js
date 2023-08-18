import { DataContext } from "common/DataContext";
import { AuthContext } from "common/AuthContext";
import useToggle from "hooks/useToggle";
import { useLocalStorageState } from "common/useLocalStorageState";
import { SectionSubtitle } from "components/commonComponents/commonComponents";
import { SSO_URL } from "components/constants";
import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import styled, { css } from "styled-components";
import { fetcher } from "../../calls";
import { SectionTitle } from "components/commonComponents/commonComponents";
import "./styles.css";
import {
  Header,
  KaartLogoClosed,
  KaartLogoOpen,
  MenuItem,
  MenuItemTop,
  ProjectIconContainer,
  RoleBarWrapper,
  RoleHeader,
  RoleSubHeader,
  SidebarClosedContainer,
  SidebarOpenedContainer,
} from "./styles.js";
import {
  User as UserIcon,
  Users as UsersIcon,
  Briefcase as BriefcaseIcon,
  Map as MapIcon,
  Cpu as CpuIcon,
  LogOut as LogoutIcon,
  ExternalLink as ExternalLinkIcon
} from 'react-feather';

let map_url = "https://kaart.com/dev/viewer/";

export const ListItems = styled.li`
  margin-right: 6%;
  color: #9095a4;

  ${(props) =>
    props.activeTab &&
    css`
      color: #0095ff;

      ::after {
        content: "";
        position: relative;
        height: 5px;
        margin-top: 0.5rem;
        border-radius: 5px 5px 0 0;
        background-color: #0095ff;
        display: block;
      }
    `}
`;

export const List = styled.ul`
  display: flex;
  list-style-type: none;
  float: right;
  flex-direction: row;
  border-bottom: 1px solid lightgray;
  width: 100%;
`;

const Sidebar = (props) => {
  // COMPONENT STATES & SETTERS //
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [toolbarExpanded, toggleToolbarExpanded] = useToggle(false);
  const [daysExpanded, toggleDaysExpanded] = useToggle(false);
  const [localUser, setLocalUser] = useLocalStorageState("viewer.user", null);
  // DATA CONTEXT STATES AND FUNCTIONS //
  const { history, sidebarOpen } = useContext(DataContext);

  const { user, refresh } = useContext(AuthContext);

  useEffect(() => {
    if (user === null) {
      history("/login");
    }
    if (user) {
      refresh();
    }
    let url = "user/fetch_user_role";
    fetcher(url).then((response) => {
      if (response.status === 200) {
        setRole(response.role);
        setName(response.name);
        if (response.role === "admin") {
          setLink("admindash");
        } else {
          setLink("dashboard");
        }
      } else if (response.status === 304) {
        history("/");
      } else {
        alert(response.message);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // LOG THE CURRENT USER OUT & REDIRECT TO LOGIN PAGE //
  const logout = () => {
    fetch(SSO_URL.concat("auth/logout"), {
      method: "POST",
    }).then(() => {
      setLocalUser(null);
      history("/login");
    });
  };

  // COMPONENT RENDER - COULD USE SOME WORK GENERALIZING,COMPARTMENTALIZING & REUSING INDIVIDUAL COMPONENTS //
  return (
    <div>
      {sidebarOpen ? (
        <SidebarOpenedContainer>
          <MenuItemTop>
            <KaartLogoOpen onClick={props.toggleSidebar} />
          </MenuItemTop>
          <MenuItemTop>
            <RoleBarWrapper>
              <RoleHeader>{name}</RoleHeader>
              <RoleSubHeader>{role}</RoleSubHeader>
            </RoleBarWrapper>
          </MenuItemTop>
          {role === "admin" ? (
            <>
              <NavLink to={"/admindash"} style={{ textDecoration: "none" }}>
                <MenuItem>
                  <ProjectIconContainer>
                    <MapIcon />
                  </ProjectIconContainer>
                  <Header>Admin Dashboard</Header>
                </MenuItem>
              </NavLink>

              <NavLink to="/users" style={{ textDecoration: "none" }}>
                <MenuItem>
                  <ProjectIconContainer>
                    <UsersIcon />
                  </ProjectIconContainer>
                  <Header>Users</Header>
                </MenuItem>
              </NavLink>

              <NavLink to="/company" style={{ textDecoration: "none" }}>
                <MenuItem>
                  <ProjectIconContainer>
                    <BriefcaseIcon />
                  </ProjectIconContainer>
                  <Header>Company</Header>
                </MenuItem>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to={"/dashboard"} style={{ textDecoration: "none" }}>
                <MenuItem>
                  <ProjectIconContainer>
                    <MapIcon />
                  </ProjectIconContainer>
                  <Header>Dashboard</Header>
                </MenuItem>
              </NavLink>
            </>
          )}

          <NavLink to="/account" style={{ textDecoration: "none" }}>
            <MenuItem>
              <ProjectIconContainer>
                <UserIcon />
              </ProjectIconContainer>
              <Header>Account</Header>
            </MenuItem>
          </NavLink>

          <NavLink to="/software" style={{ textDecoration: "none" }}>
            <MenuItem>
              <ProjectIconContainer>
                <CpuIcon />
              </ProjectIconContainer>
              <Header>Software</Header>
            </MenuItem>
          </NavLink>

          <MenuItem onClick={logout}>
            <ProjectIconContainer>
              <LogoutIcon onClick={logout}  />
            </ProjectIconContainer>
            <Header onClick={logout}>Log Out</Header>
          </MenuItem>

          <MenuItem href={map_url} target="_blank">
            <ProjectIconContainer>
              <ExternalLinkIcon href={map_url} target="_blank" />
            </ProjectIconContainer>
            <Header href={map_url} target="_blank">
              Kaart.com
            </Header>
          </MenuItem>
        </SidebarOpenedContainer>
      ) : (
        <SidebarClosedContainer>
          <MenuItemTop>
            <KaartLogoClosed onClick={props.toggleSidebar} />
          </MenuItemTop>
        </SidebarClosedContainer>
      )}
    </div>
  );
};

// COMPONENT EXPORT //
export default Sidebar;
