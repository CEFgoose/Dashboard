import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { isValid, format, parse } from "date-fns";
// import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LocalizationProvider from "@mui/lab/LocalizationProvider";
// import { KeyboardDatePicker } from '@material-ui/pickers';
import { DatePicker } from "@mui/x-date-pickers";
import IsoDatetimeStringToLocalString from "../utils/IsoDatetimeStringToLocalString";
import { getUser, setUser } from "../utils/auth";
import { integrations, genders, roles } from "../utils/constants";
import axios from "network";
import Sidebar from "../sidebar/sidebar";
import { DataContext } from "common/DataContext";
import { AuthContext } from "common/AuthContext";

export const AccountPage = () => {
  const [state, setState] = useState({
    // underbarred to match server schema.
    // editable by self
    first_name: "",
    last_name: "",
    birthday: "",
    gender: "",
    phone: "",
    // editable by admin
    // role: '',
    is_active: "",
    integrations: [],
    // not editable
    id: "",
    email: "",
    invited_datetime: "",
    last_active_datetime: "",
    email_confirmed_datetime: "",
    // component state
    isSubmitting: false,
    menuAnchorEl: null,
  });

  let { id } = useParams();
  let user = getUser();
  id = id === "me" ? user.id : id;

  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/users/${id}`).then((response) => {
      setState({
        ...state,
        ...response.data.result,
        birthday: response.data.result.birthday
          ? format(
              parse(response.data.result.birthday, "yyyy-MM-dd", new Date()),
              "MM/dd/yyyy"
            )
          : null,
      });
    });
  }, [id]);

  const handleChange = (event) => {
    setState({
      ...state,
      [event.target.name]: event.target.value,
    });
  };

  const handleDateChange = (date) => {
    if (isValid(date)) {
      const stringDate = format(date, "MM/dd/yyyy");
      setState({ ...state, birthday: stringDate });
    }
  };

  const handleIntegrationChange = (event) => {
    let newIntegrations = [...state.integrations];

    if (event.target.checked) {
      // add to array of integrations
      newIntegrations.push(event.target.name);
    } else {
      // remove from array
      newIntegrations = newIntegrations.filter(
        (integration) => integration !== event.target.name
      );
    }
    // remove duplicates just in case something fails
    setState({ ...state, integrations: [...new Set(newIntegrations)] });
  };

  const submitUpdates = () => {
    setState({ ...state, isSubmitting: true });
    // we can safely send the whole state to server because it will ignore extra params or those you don't have permissions to
    axios
      .put(`/api/users/${id}`, { ...state })
      .then((response) => {
        // update state
        setState({ ...state, ...response.data.result });
        // if this was you, also update you
        if (id === user.id) {
          setUser({ ...user, ...response.data.result });
          user = getUser();
        }
      })
      .finally(() => {
        setState({ ...state, isSubmitting: false });
      });
  };

  const handleMenuOpen = (event) => {
    setState({ ...state, menuAnchorEl: event.currentTarget });
  };

  const handleMenuClose = () => {
    setState({ ...state, menuAnchorEl: null });
  };

  const resendInvite = () => {
    axios.post("/api/auth/reinvite-user", { email: state.email });
  };

  const deleteUser = () => {
    // some day this could be prettier? but not often used.
    // eslint-disable-next-line no-alert
    const confirmation = window.confirm(
      "This will permanently remove this user from the system. The data will be unrecoverable. Are you sure?"
    );
    if (confirmation) {
      axios.delete(`/api/users/${id}`).then(() => {
        // navigate away; this account is gone and not coming back
        navigate("/app/", { replace: true });
      });
    }
  };

  const { sidebarOpen, handleSetSidebarState } = useContext(DataContext);

  const handleViewSidebar = () => {
    handleSetSidebarState();
  };

  const [startDate, setStartDate] = useState(new Date());

  return (
    <>
      <div className="account">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={handleViewSidebar} />
        <div style={{}}>
          <h1 style={{ paddingTop: "5vh" }}>
            <strong>Account:</strong>
          </h1>
        </div>
      </div>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100%",
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <form autoComplete="off" noValidate>
                <Card>
                  <CardHeader
                    subheader=""
                    title="Profile"
                    style={{
                      backgroundColor: "#f4753c",
                    }}
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          label="First Name"
                          name="first_name"
                          onChange={handleChange}
                          required
                          value={state.first_name}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="last_name"
                          onChange={handleChange}
                          required
                          value={state.last_name}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <LocalizationProvider dateAdapter = {AdapterDateFns}>
                          <DatePicker
                            renderInput={(props) => (
                              <TextField {...props} helperText="invalid mask" />
                            )}
                            disableToolbar
                            variant="inline"
                            format="MM/dd/yyyy"
                            margin="normal"
                            id="date-picker-inline"
                            label="Birthday"
                            value={state.birthday || null}
                            onChange={handleDateChange}
                            KeyboardButtonProps={{
                              "aria-label": "change date",
                            }}
                            sx={{ marginTop: 0, width: "100%" }}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          label="Gender"
                          name="gender"
                          onChange={handleChange}
                          select
                          SelectProps={{ native: true }}
                          value={state.gender}
                          variant="outlined"
                        >
                          <option key={null} value={null} aria-label=" " />
                          {genders.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="phone"
                          onChange={handleChange}
                          type="text"
                          value={state.phone}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="text"
                          value={state.email}
                          variant="outlined"
                          disabled
                        />
                      </Grid>
                      {/* {user.role === 'admin' ? ( */}
                      <>
                        <Grid item md={6} xs={12}>
                          <TextField
                            fullWidth
                            label="Role"
                            name="role"
                            onChange={handleChange}
                            select
                            SelectProps={{ native: true }}
                            value={state.role}
                            variant="outlined"
                          >
                            {/* {roles.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))} */}
                          </TextField>
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <TextField
                            fullWidth
                            label="Active"
                            name="is_active"
                            onChange={handleChange}
                            select
                            SelectProps={{ native: true }}
                            value={state.is_active}
                            variant="outlined"
                          >
                            <option key={null} value={null} aria-label=" " />
                            <option
                              key="yes"
                              // i understand why they want to exclude a bool here, but explicit > implicit. thanks, zen of python!
                              // eslint-disable-next-line react/jsx-boolean-value
                              value={true}
                            >
                              yes
                            </option>
                            <option key="no" value={false}>
                              no (disables acccount)
                            </option>
                          </TextField>
                        </Grid>
                        <Grid item md={12} xs={12}>
                          <Typography
                            color="textPrimary"
                            gutterBottom
                            variant="h6"
                          >
                            Integrations
                          </Typography>
                          {integrations.map((integration) => (
                            <FormControlLabel
                              key={integration}
                              control={
                                <Checkbox
                                  color="primary"
                                  name={integration.toLowerCase()}
                                  checked={state.integrations.includes(
                                    integration.toLowerCase()
                                  )}
                                  onChange={handleIntegrationChange}
                                />
                              }
                              label={integration}
                            />
                          ))}
                        </Grid>
                        <Grid item md={12} xs={12}>
                          <Typography
                            color="textPrimary"
                            gutterBottom
                            variant="h6"
                          >
                            Invited:{" "}
                            {IsoDatetimeStringToLocalString(
                              state.invited_datetime
                            )}
                          </Typography>
                          <Typography
                            color="textPrimary"
                            gutterBottom
                            variant="h6"
                          >
                            Joined:{" "}
                            {IsoDatetimeStringToLocalString(
                              state.email_confirmed_datetime
                            )}
                          </Typography>
                          <Typography
                            color="textPrimary"
                            gutterBottom
                            variant="h6"
                          >
                            Last Active:{" "}
                            {IsoDatetimeStringToLocalString(
                              state.last_active_datetime
                            )}
                          </Typography>
                        </Grid>
                      </>
                      {/* ) : null} */}
                    </Grid>
                  </CardContent>
                  <Divider />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      p: 2,
                    }}
                  >
                    {/* {user.role === 'admin' ? ( */}
                    <>
                      <Button
                        aria-controls="customized-menu"
                        aria-haspopup="true"
                        onClick={handleMenuOpen}
                        sx={{
                          marginRight: "auto",
                        }}
                      >
                        Actions
                      </Button>
                      <Menu
                        id="actions-menu"
                        anchorEl={state.menuAnchorEl}
                        keepMounted
                        open={Boolean(state.menuAnchorEl)}
                        onClose={handleMenuClose}
                      >
                        <MenuItem
                          onClick={() => {
                            handleMenuClose();
                            resendInvite();
                          }}
                          disabled={Boolean(state.email_confirmed_datetime)}
                        >
                          Resend invitation email
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleMenuClose();
                            deleteUser();
                          }}
                        >
                          Permanently delete user
                        </MenuItem>
                      </Menu>
                    </>
                    {/* ) : null} */}
                    <Button
                      color="primary"
                      variant="contained"
                      padding="5px"
                      disabled={state.isSubmitting}
                      onClick={submitUpdates}
                    >
                      Save details
                    </Button>

                    <Button
                      color="primary"
                      onClick={() =>
                        window.open(
                          "https://my.kaart.com/password-reset",
                          "_blank",
                          "width=800, height=600"
                        )
                      }
                    >
                      Reset Password
                    </Button>
                  </Box>
                </Card>
              </form>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};
