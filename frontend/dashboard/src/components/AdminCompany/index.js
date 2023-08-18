import React, { useContext, useState, useEffect } from "react";
import { InteractionContext } from "common/InteractionContext";
import { DataContext } from "common/DataContext";
import { AuthContext } from "common/AuthContext";
import Sidebar from "../sidebar/sidebar";
import "./styles.css";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  TextField,
} from "@mui/material";
import { states, countries } from "../utils/constants";

export const Company = () => {
  // const [state, setState] = useState({
  // user editable
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [address2, setAddress2] = useState("");
  const [zip, setZip] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("US");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [joined_date, setJoined_date] = useState("");
  const [id, setId] = useState("");
  const [payment_info, setPayment_info] = useState({});
  // component state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [clientToken, setClientToken] = useState(null);
  const { sidebarOpen, handleSetSidebarState } = useContext(DataContext);
  const { refresh, user } = useContext(AuthContext);

  const handleViewSidebar = () => {
    handleSetSidebarState();
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handlePhoneChange = (event) => {
    setPhone(event.target.value);
  };

  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

  const handleAddress2Change = (event) => {
    setAddress2(event.target.value);
  };

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  const handleStateChange = (event) => {
    setState(event.target.value);
  };

  const handleZipChange = (event) => {
    setZip(event.target.value);
  };

  const handleCountryChange = (event) => {
    setCountry(event.target.value);
  };

  // useEffect(() => {
  //   axios.get("/api/company").then((response) => {
  //     setState({
  //       ...state,
  //       ...response.data.result,
  //       // sort descending by id to ensure the newest ones are on top
  //       payment_history: response.data.result.payment_history.sort(
  //         (a, b) => Number(b.id) - Number(a.id)
  //       ),
  //       initialDataLoaded: true,
  //     });
  //   });
  // }, []);

  // const submitUpdates = () => {
  //   setIsSubmitting(true);
  // };
  // // we can safely send the whole state to server because it will ignore extra params or those you don't have permissions to
  // axios
  //   .put("/api/company", { ...state })
  //   .then((response) => {
  //     // update state
  //     setState({ ...state, ...response.data.result });
  //   })
  //   .finally(() => {
  //     setState({ ...state, isSubmitting: false });
  //   });

  return (
    <>
      <div className="company">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={handleViewSidebar} />
        <div style={{}}>
          <h1 style={{ paddingTop: "5vh" }}>
            <strong>Company:</strong>
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
        <Container
          maxWidth="lg"
          sx={{
            paddingBottom: "24px",
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <form autoComplete="on" noValidate>
                <Card>
                  <CardHeader
                    subheader=""
                    title="Company Info"
                    style={{
                      backgroundColor: "#f4753c",
                    }}
                  />
                  <Divider />
                  <CardContent>
                    {/* {initialDataLoaded ? ( */}
                    <Grid container spacing={3}>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          label="Name"
                          name="name"
                          onChange={handleNameChange}
                          required
                          value={name || ""}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="phone"
                          onChange={handlePhoneChange}
                          type="tel"
                          placeholder="123-456-7890"
                          pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
                          value={phone || ""}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          label="Address"
                          name="address"
                          onChange={handleAddressChange}
                          required
                          value={address || ""}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          label="Address 2"
                          name="address2"
                          onChange={handleAddress2Change}
                          value={address2 || ""}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          label="City"
                          name="city"
                          onChange={handleCityChange}
                          required
                          value={city || ""}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          label="State"
                          name="state"
                          onChange={handleStateChange}
                          select
                          SelectProps={{ native: true }}
                          value={state || ""}
                          variant="outlined"
                        >
                          <option key={null} value={null} aria-label=" " />
                          <option key="international" value="international">
                            International
                          </option>
                          {states.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.text}
                            </option>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          label="Zip"
                          name="zip"
                          onChange={handleZipChange}
                          type="text"
                          value={zip || ""}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          label="Country"
                          name="country"
                          onChange={handleCountryChange}
                          select
                          SelectProps={{ native: true }}
                          value={country || ""}
                          variant="outlined"
                        >
                          <option key={null} value={null} aria-label=" " />
                          {countries.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.text}
                            </option>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                    {/* ) : null}  */}
                  </CardContent>
                  <Divider />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      p: 2,
                    }}
                  >
                    <Button
                      color="primary"
                      variant="contained"
                      disabled={isSubmitting}
                      // onClick={submitUpdates}
                    >
                      Save details
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
