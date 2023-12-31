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
  const [userSelected, setUserSelected] = useState(null);

  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [fullName, setFullName] = useState(null);
  const [OSMname, setOSMname] = useState(null);
  const [city, setCity] = useState(null);
  const [country, setCountry] = useState(null);
  const [email, setEmail] = useState(null);
  const [payEmail, setPayEmail] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [activeProjects, setActiveProjects] = useState([]);
  const [inactiveProjects, setInactiveProjects] = useState(null);

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
        setFirstName(e.target.value);
        break;
      case "last_name":
        setLastName(e.target.value);
        break;
      case "osm_name":
        setOSMname(e.target.value);
        break;
      case "city":
        setCity(e.target.value);
        break;
      case "country":
        setCountry(e.target.value);
        break;
      case "email":
        setEmail(e.target.value);
        break;
      case "pay_email":
        setPayEmail(e.target.value);
        break;
      case "response":
        setFirstName(e.first_name);
        setLastName(e.last_name);
        setFullName(e.full_name);
        setOSMname(e.osm_username);
        setCity(e.city);
        setCountry(e.country);
        setEmail(e.email);
        setPayEmail(e.payment_email);
        break;
      default:
        break;
    }
  };

  const fetchUserDetails = () => {
    let fetchUserDetailsURL = "user/fetch_user_details";
    fetcher(fetchUserDetailsURL).then((response) => {
      if (response.status === 200) {
        handleUserDetailsStates("response", response);
      } else if (response.status === 304) {
        history("/login");
      } else {
        alert(response.message);
      }
    });
  };

  const updateUserDetails = () => {
    let outpack = {
      first_name: firstName,
      last_name: lastName,
      osm_username: OSMname,
      city: city,
      country: country,
      email: email,
      payment_email: payEmail,
    };
    let updateUserDetailsURL = "user/update_user_details";
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

  const getOverpassData = () => {
    let get_overpass_data = "/overpass_data_celery";
    let outpack = {
      start_date: "08-01-2023",
      end_date: "08-07-2023",
      osm_id: [13352657],
    };
    poster(outpack, get_overpass_data).then((response) => {
      if (response.status === 200) {
      } else if (response.status === 304) {
        history.push("/");
      } else {
        alert(response.message);
      }
    });
  };

  const getTaskManagerData = () => {
    let userTaskStatsURL = "task/get_task_manager_data";
    let outpack = {
      project_id: 10218,
    };
    poster(outpack, userTaskStatsURL).then((response) => {
      if (response.status === 200) {
      } else if (response.status === 304) {
        history.push("/");
      } else {
        alert(response.message);
      }
    });
  };

  //PROJECT ORIENTED API CALLS AND HANDLERS

  const addProject = (url) => {
    let addProjectURL = "project/add_project";
    let outpack = {
      url: url,
    };
    poster(outpack, addProjectURL).then((response) => {
      if (response.status === 200) {
        alert("New Project Added");
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

    getOverpassData,
    setStartDate,
    setEndDate,

    getTaskManagerData,
    addProject,
  };

  return value ? (
    <DataContext.Provider value={value}>{children}</DataContext.Provider>
  ) : null;
};
