
import { useNavigate } from "react-router-dom";
import { InteractionContext } from "common/InteractionContext";
import { AuthContext } from "common/AuthContext";
import { API_URL } from "components/constants";
import { fetcher, poster } from "../../calls";
import useToggle from "../../hooks/useToggle";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";



// CONTEXT IMPORTS //
export const DataContext = createContext({});
export const DataProvider = ({ children }) => {
  const {} = useContext(InteractionContext);
  const {} = useContext(AuthContext);

  const [sidebarOpen, toggleSidebarOpen] = useToggle(true);
  const [orgUsers, setOrgUsers] = useState([]);


  const [fetching, setFetching] = useState(false);
  const history = useNavigate();
  const [userSelected, setUserSelected] = useState(null);



  const handleSetSidebarState = () => {
    toggleSidebarOpen();
  };



  // FETCH ORGANIZATION USERS //
  const fetchOrgUsers = () => {
    let fetchUsersURL = "organization/fetch_users";
    fetcher(fetchUsersURL).then((response) => {
      console.log(response.status);
      if (response.status === 200) {
        setOrgUsers(response.users);
      } else if (response.status === 304) {
        history.push("/login");
      } else {
        alert(response.message);
      }
    });
  };

  // MODIFY USER ROLE  //
  const modifyUser = (id, role) => {
    let modifyUsersURL = "organization/modify_users";
    let outpack = {
      user_id: id,
      role: role,
    };
    console.log(outpack);
    poster(outpack, modifyUsersURL).then((response) => {
      if (response.status === 200) {
        return;
      } else if (response.status === 304) {
        history.push("/login");
      } else {
        alert(response.message);
      }
    });
  };

  // REMOVE USER FROM ORGANIZATION //
  const removeUser = (id) => {
    let removeUsersURL = "organization/remove_users";
    let outpack = {
      user_id: id,
    };
    console.log(outpack);
    poster(outpack, removeUsersURL).then((response) => {
      if (response.status === 200) {
        return;
      } else if (response.status === 304) {
        history.push("/login");
      } else {
        alert(response.message);
      }
    });
  };

  // MODIFY USER ROLE //
  const inviteUser = (payload) => {
    let inviteUserURL = "user/invite_user";
    let outpack = {
      // email: email,

      payload: payload,

    };
    poster(outpack, inviteUserURL).then((response) => {
      if (response.status === 304) {
        history.push("/login");
      } else {
        alert(response.message);
      }
    });
  };


  const value = {
    history,
    orgUsers,
    sidebarOpen,
    fetching,
    handleSetSidebarState,
    setUserSelected,
    setFetching,
    fetchOrgUsers,
    inviteUser,
    removeUser,
    modifyUser,
  };

  return value ? (
    <DataContext.Provider value={value}>{children}</DataContext.Provider>
  ) : null;
};
