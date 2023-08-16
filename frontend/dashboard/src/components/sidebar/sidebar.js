
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
import dashicon from "../../images/bullet-list-50.png";
import leftArrow from "../../images/left-arrow-50.png";
import logouticon from "../../images/log-out-50.png";
import tools_icon from "../../images/tools_icon.png";
import page_icon from "../../images/page-icon.png";
import { SectionTitle } from "components/commonComponents/commonComponents";
import "./styles.css";
import {
  CollapseMenuIcon,
  Header,
  KaartLogoClosed,
  KaartLogoOpen,
  MenuItem,
  MenuItemTop,
  OpenMenuIcon,
  OpenMenuIconButton,
  OpenMenuIconContainer,
  ProjectIcon,
  ProjectIconContainer,
  RoleBarWrapper,
  RoleHeader,
  RoleSubHeader,
  SidebarClosedContainer,
  SidebarOpenedContainer,
} from "./styles.js";
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

  const [number, setNumber] = useState(50);

  const [toolbarExpanded, toggleToolbarExpanded] = useToggle(false);
  const [daysExpanded, toggleDaysExpanded] = useToggle(false);
  const [localUser, setLocalUser] = useLocalStorageState("viewer.user", null);
  // DATA CONTEXT STATES AND FUNCTIONS //
  const {
    history,
    sidebarOpen,
  } = useContext(DataContext);

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
          setLink("/admindash");
        } else {
          setLink("/dashboard");
        }
      } else if (response.status === 304) {
        history.push("/");
      } else {
        alert(response.message);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleToolbar = (e) => {
    toggleToolbarExpanded();
  };


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

            <CollapseMenuIcon onClick={props.toggleSidebar} />
          </MenuItemTop>
          <SectionTitle title_text={"TABULA RASA"}/>
          <MenuItemTop>
            <RoleBarWrapper>
              <RoleHeader>{name}</RoleHeader>
              <RoleSubHeader>{role}</RoleSubHeader>
            </RoleBarWrapper>
          </MenuItemTop>
          {role === "admin" ? (
            <>
              <NavLink to={link} style={{ textDecoration: "none" }}>
                <MenuItem>
                  <ProjectIconContainer>
                    <ProjectIcon src={dashicon} />
                  </ProjectIconContainer>
                  <Header>Admin Dashboard</Header>
                </MenuItem>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to={link} style={{ textDecoration: "none" }}>
                <MenuItem>
                  <ProjectIconContainer>
                    <ProjectIcon src={dashicon} />
                  </ProjectIconContainer>
                  <Header>Dashboard</Header>
                </MenuItem>
              </NavLink>
            </>
          )}
          <NavLink to="/page1" style={{ textDecoration: "none" }}>
            <MenuItem>
              <ProjectIconContainer>
                <ProjectIcon src={page_icon} />
              </ProjectIconContainer>
              <Header>Page 1</Header>
            </MenuItem>
          </NavLink>

          <NavLink to="/page2" style={{ textDecoration: "none" }}>
            <MenuItem>
              <ProjectIconContainer>
                <ProjectIcon src={page_icon} />
              </ProjectIconContainer>
              <Header>Page 2</Header>
            </MenuItem>
          </NavLink>



          <MenuItem onClick={logout}>
            <ProjectIconContainer>
              <ProjectIcon onClick={logout} src={logouticon} />
            </ProjectIconContainer>
            <Header onClick={logout}>Log Out</Header>
          </MenuItem>
          <MenuItem href={map_url} target="_blank">
            <ProjectIconContainer>
              <ProjectIcon href={map_url} target="_blank" src={leftArrow} />
            </ProjectIconContainer>
            <Header href={map_url} target="_blank">
              Kaart.com
            </Header>
          </MenuItem>


          <MenuItem onClick={() => handleToolbar()}>
            <ProjectIconContainer onClick={() => handleToolbar()}>
              <ProjectIcon onClick={() => handleToolbar()} src={tools_icon} />
            </ProjectIconContainer>
            <Header onClick={() => handleToolbar()}>Tools</Header>
          </MenuItem>
          {toolbarExpanded === true ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "white",
              }}
            >
              <div style={{ display: "flex", flexDirection: "row" }}>
                <SectionSubtitle
                  subtitle_text={`Number Slider: ${number}`}
                  style={{ marginRight: "0" }}
                />
                <input
                  style={{ width: "3.5vw", marginLeft: "0" }}
                  type="range"
                  min={1}
                  max={50}

                  // value={50000 / 1000}

                  step={1}
                  onChange={(e) => e.target.value > 9 ? setNumber(e.target.value) : setNumber(`0`.concat(e.target.value))}
                ></input>
              </div>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <SectionSubtitle subtitle_text={`Checkbox control`} />
                <input type="checkbox" onChange={(e) => console.log(e)} />
              </div>
              <button
                style={{
                  backgroundColor: "white",
                  margin: "auto",
                  marginTop: "1vh",
                  width: "80%",
                }}
                onClick={() => console.log('button 1 clicked!')}
              >
                Button 1
              </button>
              <button
                style={{
                  backgroundColor: "white",
                  margin: "auto",
                  marginTop: "1vh",
                  width: "80%",
                }}
                onClick={() => console.log('button 2 clicked!')}
              >
                Button 2
              </button>
            </div>
          ) : (
            <></>
          )}
        </SidebarOpenedContainer>
      ) : (
        <SidebarClosedContainer>
          <MenuItemTop>
            <KaartLogoClosed onClick={props.toggleSidebar} />
            <OpenMenuIconContainer>
              <OpenMenuIconButton>
                <OpenMenuIcon onClick={props.toggleSidebar} />
              </OpenMenuIconButton>
            </OpenMenuIconContainer>
          </MenuItemTop>
        </SidebarClosedContainer>
      )}
    </div>
  );
};

// COMPONENT EXPORT //
export default Sidebar;
