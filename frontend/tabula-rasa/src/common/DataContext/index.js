import { useNavigate } from "react-router-dom";
import { useHistory } from "react-router-dom";
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
  const [userSelected, setUserSelected] = useState("");

  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [email, setEmail] = useState("");
  const [invitationsAreSending, setInvitationsAreSending] = useState(false);
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState([]);
  const [phone, setPhone] = useState("");
  // editable by admin
  const [role, setRole] = useState([]);
  const [is_active, setIs_active] = useState([]);
  const [integrations, setIntegrations] = useState([]);

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
        history("/login");
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
        history("/login");
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
        history("/login");
      } else {
        alert(response.message);
      }
    });
  };

  // MODIFY USER ROLE //
  const inviteUser = (email) => {
    let inviteUserURL = "user/invite_user";
    let outpack = {
      email: email,
    };
    poster(outpack, inviteUserURL).then((response) => {
      if (response.status === 304) {
        history("/login");
      } else {
        alert(response.message);
      }
    });
  };

  const handleUserDetailsStates = (state, e) => {
    switch (state) {
      case "first_name":
        setFirst_name(e.target.value);
        break;
      case "last_name":
        setLast_name(e.target.value);
        break;
      case "birthday":
        setBirthday(e.target.value);
        break;
      case "gender":
        setGender(e.target.value);
        break;
      case "phone":
        setPhone(e.target.value);
        break;
      case "email":
        setEmail(e.target.value);
        break;
      case "is_active":
        setIs_active(e.target.value);
        break;
      case "integrations":
        setIntegrations(e.target.value);
        break;
      case "response":
        setFirst_name(e.first_name);
        setLast_name(e.last_name);
        setEmail(e.email);
        setGender(e.gender);
        setBirthday(e.birthday);
        setIs_active(e.is_active);
        setIntegrations(e.integrations);

        break;
      default:
        break;
    }
  };

  const fetchUserDetails = () => {
    let fetchUserDetailsURL = "users/fetch_user_details";
    fetcher(fetchUserDetailsURL).then((response) => {
      if (response.status === 200) {
        handleUserDetailsStates("response", response);
        console.log(response)
      } else if (response.status === 304) {
        history("/login");
      } else {
        alert(response.message);
      }
    });
  

  };

  const updateUserDetails = () => {
    let outpack = {
      first_name: first_name,
      last_name: last_name,
      email: email,
      birthday: birthday,
      gender: gender,
      role: role,
      phone: phone,
      is_active: is_active,
    };
    let updateUserDetailsURL = "users/update_user_details";
    poster(outpack, updateUserDetailsURL).then((response) => {
      if (response.status === 200) {
        return;
      } else if (response.status === 304) {
        history("/login");
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
    fetchUserDetails,
    updateUserDetails,
    handleUserDetailsStates,
    invitationsAreSending,
    setInvitationsAreSending,
    gender,
    setGender,
    first_name,
    setFirst_name,
    last_name,
    setLast_name,
    birthday,
    setBirthday,
    email,
    setEmail,
    is_active,
    setIs_active,
    phone,
    setPhone,
    role,
    setRole,
  };

  return value ? (
    <DataContext.Provider value={value}>{children}</DataContext.Provider>
  ) : null;
};
