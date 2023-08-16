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
// import { KeyboardDatePicker } from '@material-ui/pickers';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import IsoDatetimeStringToLocalString from "../utils/IsoDatetimeStringToLocalString";
import { getUser, setUser } from "../utils/auth";
import { integrations, genders, roles } from "../utils/constants";
import Sidebar from "../sidebar/sidebar";
import { DataContext } from "common/DataContext";
import { AuthContext } from "common/AuthContext";

export const AccountPage = () => {
  // not editable
  //const [id, setid] = useState("");
  const [invited_datetime, setInvalid_datetime] = useState("");
  const [last_active_datetime, setLast_active_datetime] = useState("");
  const [email_confirmed_datetime, setEmail_confirmed_datetime] = useState("");
  // component state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  let { id } = useParams();
  id = id === "me" ? user.id : id;

  const {
    history,
    fetchUserDetails,
    updateUserDetails,
    first_name,
    setFirst_name,
    last_name,
    setLast_name,
    email,
    setEmail,
    birthday,
    setBirthday,
    gender,
    setGender,
    phone,
    setPhone,
    role,
    setRole,
    is_active,
    setIs_active,
    integrations,
    setIntegrations,
  } = useContext(DataContext);

  const { refresh, user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      refresh();
    }
    if (user === null) {
      history("/login");
    }
    if (user !== null && user.role !== "admin") {
      history("/login");
    }
    fetchUserDetails();
    // eslint-disable-next-line
  }, []);

  const handleFirstNameChange = (event) => {
    setFirst_name(event.target.value);
  };

  const handleLastNameChange = (event) => {
    setLast_name(event.target.value);
  };

  const handleGenderChange = (event) => {
    setGender(event.target.value);
  };

  const handlePhoneChange = (event) => {
    setPhone(event.target.value);
  };

  const handleRoleChange = (event) => {
    setRole(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleIs_activeChange = (event) => {
    setIs_active(event.target.value);
  };

  const handleDateChange = (date) => {
    if (isValid(date)) {
      // const stringDate = format(date, "MM/dd/yyyy");
      setBirthday(date);
    }
  };

  const handleIntegrationChange = (event) => {
    let newIntegrations = [integrations];

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
    setIntegrations(newIntegrations);
  };

  const submitUpdates = () => {
    updateUserDetails();
  };

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const resendInvite = () => {
    fetch("/auth/reinvite-user", email);
  };

  const deleteUser = () => {
    // // some day this could be prettier? but not often used.
    // // eslint-disable-next-line no-alert
    // const confirmation = window.confirm(
    //   "This will permanently remove this user from the system. The data will be unrecoverable. Are you sure?"
    // );
    // if (confirmation) {
    //   axios.delete(`/api/users/${id}`).then(() => {
    //     // navigate away; this account is gone and not coming back
    //     navigate("/app/", { replace: true });
    //   });
    // }
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
                          onChange={handleFirstNameChange}
                          required
                          value={first_name}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="last_name"
                          onChange={handleLastNameChange}
                          required
                          value={last_name}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            textFi={(props) => (
                              <TextField {...props} helperText="invalid mask" />
                            )}
                            disableToolbar
                            variant="inline"
                            format="MM/dd/yyyy"
                            margin="normal"
                            id="date-picker-inline"
                            label="Birthday"
                            value={birthday || null}
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
                          onChange={handleGenderChange}
                          select
                          SelectProps={{ native: true }}
                          value={gender || []}
                          variant="outlined"
                        >
                          <option key={null} value={null} aria-label=" " />
                          {genders?.map((option) => (
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
                          onChange={handlePhoneChange}
                          type="text"
                          value={phone}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="text"
                          value={email}
                          variant="outlined"
                          disabled
                        />
                      </Grid>
                      {user.role === "admin" ? (
                        <>
                          <Grid item md={6} xs={12}>
                            <TextField
                              fullWidth
                              label="Role"
                              name="role"
                              onChange={handleRoleChange}
                              select
                              SelectProps={{ native: true }}
                              value={role || []}
                              variant="outlined"
                            >
                              {roles?.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid item md={6} xs={12}>
                            <TextField
                              fullWidth
                              label="Active"
                              name="is_active"
                              onChange={handleIs_activeChange}
                              select
                              SelectProps={{ native: true }}
                              value={is_active || []}
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
                            {integrations?.map((integration) => (
                              <FormControlLabel
                                key={integration}
                                control={
                                  <Checkbox
                                    color="primary"
                                    name={integration.toLowerCase()}
                                    checked={integrations.includes(
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
                              {IsoDatetimeStringToLocalString(invited_datetime)}
                            </Typography>
                            <Typography
                              color="textPrimary"
                              gutterBottom
                              variant="h6"
                            >
                              Joined:{" "}
                              {IsoDatetimeStringToLocalString(
                                email_confirmed_datetime
                              )}
                            </Typography>
                            <Typography
                              color="textPrimary"
                              gutterBottom
                              variant="h6"
                            >
                              Last Active:{" "}
                              {IsoDatetimeStringToLocalString(
                                last_active_datetime
                              )}
                            </Typography>
                          </Grid>
                        </>
                      ) : null}
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
                    {user.role === "admin" ? (
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
                          anchorEl={menuAnchorEl}
                          keepMounted
                          open={Boolean(menuAnchorEl)}
                          onClose={handleMenuClose}
                        >
                          <MenuItem
                            onClick={() => {
                              handleMenuClose();
                              resendInvite();
                            }}
                            disabled={Boolean(email_confirmed_datetime)}
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
                    ) : null}
                    <Button
                      color="primary"
                      variant="contained"
                      padding="5px"
                      disabled={isSubmitting}
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
