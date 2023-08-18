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
import { states, integrations } from "../utils/constants";
import { CreditCard as CreditCardIcon } from "react-feather";
import IsoDatetimeStringToLocalString from "../utils/IsoDatetimeStringToLocalString";

let btInstance = null;

export const Company = () => {
  const [state, setState] = useState({
    // user editable
    name: "",
    address: "",
    address2: "",
    zip: "",
    city: "",
    country: "",
    phone: "",
    state: "",
    // loaded from the api, but just for reference-- user cannot edit
    next_bill_date: "",
    plan: {
      // looks something like this, but subject to change...
      // orca: 700,
      // base_fee: 5000,
      // mongoose: 300,
      // per_user: 500
    },
    payment_history: [],
    joined_date: "",
    id: "",
    payment_info: {},
    // component state
    isSubmitting: false,
    initialDataLoaded: false,
    paymentModalOpen: false,
    clientToken: null,
  });
  const {} = useContext(InteractionContext);
  const {} = useContext(DataContext);
  const { sidebarOpen, handleSetSidebarState } = useContext(DataContext);
  const { refresh, user } = useContext(AuthContext);
  const handleViewSidebar = () => {
    handleSetSidebarState();
  };

  const handleChange = (event) => {
    setState({
      ...state,
      [event.target.name]: event.target.value,
    });
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
        open={state.paymentModalOpen}
        onClose={() =>
          setState({ ...state, paymentModalOpen: false, clientToken: null })
        }
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Update Payment Method</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Updating this payment method will take effect immediately and all
            future invoices will be charged against the new payment method.
          </DialogContentText>
          {!state.clientToken ? (
            <div style={{ textAlign: "center" }}>
              <CircularProgress />
            </div>
          ) : (
            <DropIn
              options={{ authorization: state.clientToken }}
              onInstance={(instance) => {
                btInstance = instance;
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setState({ ...state, paymentModalOpen: false, clientToken: null })
            }
            color="primary"
            disabled={state.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            // onClick={updatePaymentInfo}
            color="primary"
            disabled={state.isSubmitting}
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
                    {/* {state.initialDataLoaded ? ( */}
                    <Grid container spacing={3}>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          label="Name"
                          name="name"
                          onChange={handleChange}
                          required
                          value={state.name || ""}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="phone"
                          onChange={handleChange}
                          type="number"
                          value={state.phone || ""}
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
                          value={state.address || ""}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          label="Address 2"
                          name="address2"
                          onChange={handleChange}
                          value={state.address2 || ""}
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
                          value={state.city || ""}
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
                          value={state.state || ""}
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
                          type="number"
                          value={state.zip || ""}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          label="Country"
                          name="country"
                          onChange={handleChange}
                          required
                          value={state.country || ""}
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                    {/* ) : null} */}
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
                      disabled={state.isSubmitting}
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
                  {/* {state.initialDataLoaded ? ( */}
                  <Grid container spacing={3}>
                    <Grid item md={6} xs={12}>
                      <Typography color="textPrimary" gutterBottom variant="h6">
                        Plan
                      </Typography>
                      {Object.keys(state.plan && state.plan).length !== 0
                        ? [
                            <Typography
                              key="base"
                              color="textPrimary"
                              gutterBottom
                              variant="h6"
                            >
                              ${state.plan.base_fee / 100.0}
                              base fee + ${state.plan.per_user / 100.0}
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
                                {state.plan[integration.toLowerCase()] / 100.0}/
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
                      {Object.keys(state.payment_info ? state.payment_info : {})
                        .length !== 0 ? (
                        <Chip
                          avatar={
                            <Avatar
                              alt="Payment method"
                              src={state.payment_info.image_url}
                            />
                          }
                          label={`${state.payment_info.card_type}*${state.payment_info.last_4}`}
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
                      {state.payment_history.slice(0, 6).map((invoice) => (
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
                  {/* ) : null} */}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};