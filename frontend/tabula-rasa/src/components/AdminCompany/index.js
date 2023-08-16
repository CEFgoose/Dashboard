import React, { useContext, useState, useEffect } from "react";
import { InteractionContext } from "common/InteractionContext";
import { DataContext } from "common/DataContext";
import { AuthContext } from "common/AuthContext";
import Sidebar from "../sidebar/sidebar";
import "./styles.css";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import DropIn from "braintree-web-drop-in-react";
import { states, integrations, countries } from "../utils/constants";
import { CreditCard as CreditCardIcon } from "react-feather";
import IsoDatetimeStringToLocalString from "../utils/IsoDatetimeStringToLocalString";

let btInstance = null;

export const Company = () => {
  // const [state, setState] = useState({
    // user editable
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [address2, setAddress2] = useState("");
    const [zip, setZip] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("US");
    const [phone, setPhone ] = useState("");
    const [state, setState ] = useState("");
    // loaded from the api, but just for reference-- user cannot edit
    const [next_bill_date, setNext_bill_date] = useState("");
    const [plan, setPlan] = useState ({
      // looks something like this, but subject to change...
      orca: 700,
      base_fee: 5000,
      mongoose: 300,
      per_user: 500
    });
    const [payment_history, setPayment_history] = useState([]);
    const [joined_date, setJoined_date] = useState("");
    const [id, setId] = useState("");
    const [payment_info, setPayment_info] = useState({});
    // component state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [clientToken, setClientToken] = useState(null);
  //});
  const {} = useContext(InteractionContext);
  const {} = useContext(DataContext);
  const { sidebarOpen, handleSetSidebarState } = useContext(DataContext);
  const { refresh, user } = useContext(AuthContext);
  const handleViewSidebar = () => {
    handleSetSidebarState();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
      // Automatically set country to "US" if "International" is selected in state
      country: value === 'international' ? 'international' : prevState.country,
    }));
  };

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
      <Dialog
        open={paymentModalOpen}
        onClose={() =>
          (setPaymentModalOpen(false), setClientToken(null) )
        }
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Update Payment Method</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Updating this payment method will take effect immediately and all
            future invoices will be charged against the new payment method.
          </DialogContentText>
          {!clientToken ? (
            <div style={{ textAlign: "center" }}>
              <CircularProgress />
            </div>
          ) : (
            <DropIn
              options={{ authorization:clientToken }}
              onInstance={(instance) => {
                btInstance = instance;
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              (setPaymentModalOpen(false), 
                setClientToken(null) )
            }
            color="primary"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            // onClick={updatePaymentInfo}
            color="primary"
            disabled={isSubmitting}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
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
                    {initialDataLoaded ? (
                    <Grid container spacing={3}>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          label="Name"
                          name="name"
                          onChange={handleChange}
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
                          onChange={handleChange}
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
                          onChange={handleChange}
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
                          onChange={handleChange}
                          value={address2 || ""}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          label="City"
                          name="city"
                          onChange={handleChange}
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
                          onChange={handleChange}
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
                          onChange={handleChange}
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
                          onChange={handleChange}
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
                     ) : null} 
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
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  subheader=""
                  title="Billing Info"
                  style={{
                    backgroundColor: "#f4753c",
                  }}
                />
                <Divider />
                <CardContent>
                   {initialDataLoaded ? ( 
                  <Grid container spacing={3}>
                    <Grid item md={6} xs={12}>
                      <Typography color="textPrimary" gutterBottom variant="h6">
                        Plan
                      </Typography>
                      {Object.keys(plan && plan).length !== 0
                        ? [
                            <Typography
                              key="base"
                              color="textPrimary"
                              gutterBottom
                              variant="h6"
                            >
                              ${plan.base_fee / 100.0}
                              base fee + ${plan.per_user / 100.0}
                              /active user/month
                            </Typography>,
                            ...integrations.map((integration) => (
                              <Typography
                                key={integration}
                                color="textPrimary"
                                gutterBottom
                                variant="h6"
                              >
                                + $
                                {plan[integration.toLowerCase()] / 100.0}/
                                {integration}
                                user/month
                              </Typography>
                            )),
                          ]
                        : null}
                      <br />
                      <Typography color="textPrimary" gutterBottom variant="h6">
                        Payment Method
                      </Typography>
                      {Object.keys(payment_info ? payment_info : {})
                        .length !== 0 ? (
                        <Chip
                          avatar={
                            <Avatar
                              alt="Payment method"
                              src={payment_info.image_url}
                            />
                          }
                          label={`${payment_info.card_type}*${payment_info.last_4}`}
                          clickable
                          // onClick={openUpdatePaymentInfoModal}
                          sx={{ maxWidth: "100%" }}
                        />
                      ) : (
                        <Chip
                          label="Click to add"
                          icon={<CreditCardIcon />}
                          clickable
                          // onClick={openUpdatePaymentInfoModal}
                        />
                      )}
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <Typography color="textPrimary" gutterBottom variant="h6">
                        Recent Invoices
                      </Typography>
                      {payment_history.slice(0, 6).map((invoice) => (
                        <Typography
                          color="textPrimary"
                          gutterBottom
                          variant="h6"
                          key={invoice.id}
                        >
                          {`${
                            IsoDatetimeStringToLocalString(
                              invoice.datetime
                            ).split(",")[0]
                          }: ${invoice.user_count} users ($${
                            invoice.amount / 100.0
                          })`}
                        </Typography>
                      ))}
                    </Grid>
                  </Grid>
                   ) : null} 
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};
