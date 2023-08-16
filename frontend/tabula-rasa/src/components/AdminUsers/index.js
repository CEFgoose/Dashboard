import React, { useContext, useState, useEffect } from "react";
import { InteractionContext } from "common/InteractionContext";
import { DataContext } from "common/DataContext";
import { AuthContext } from "common/AuthContext";
import Sidebar from "../sidebar/sidebar";
import "./styles.css";
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Grid,
  TextField,
  InputAdornment,
  SvgIcon,
  Table,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { Notify } from 'notiflix';
import { Search as SearchIcon } from 'react-feather';
import PerfectScrollbar from 'react-perfect-scrollbar';
import PropTypes from 'prop-types';
import { TableSortLabel } from '@mui/material';
import { integrations, roles } from '../utils/constants';
import axios from 'network';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: 'first_name',
    numeric: false,
    disablePadding: false,
    label: 'First Name'
  },
  {
    id: 'last_name',
    numeric: false,
    disablePadding: false,
    label: 'Last Name'
  },
  {
    id: 'email',
    numeric: false,
    disablePadding: false,
    label: 'Email'
  },
  {
    id: 'role',
    numeric: false,
    disablePadding: false,
    label: 'Role'
  },
  {
    id: 'is_active',
    numeric: false,
    disablePadding: false,
    label: 'Active'
  }
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired
};

export const Users = () => {
  const {} = useContext(InteractionContext);
  const {} = useContext(DataContext);
  const { sidebarOpen, handleSetSidebarState } = useContext(DataContext);
  const { refresh, user } = useContext(AuthContext);
  const handleViewSidebar = () => {
    handleSetSidebarState();
  };
  const navigate = useNavigate();

  const [state, setState] = useState({
    // used for displaying, filtering, and fetching existing users
    rows: [],
    filteredRows: [],
    usersToFetch: 'active',
    // used by invite modal to bring new users in
    emailsToInvite: [],
    roleForNewUsers: 'user',
    integrationsForNewUsers: [],
    invitationsAreSending: false
  });
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('last_name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [inviteModalOpen, setinviteModalOpen] = useState(false);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (event, id) => {
    navigate(`/app/account/${id}`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowsFilter = (event) => {
    const searchExp = new RegExp(
      event.target.value.replace(/[|&;$%@"<\\>()+*,[\]]/g, ''),
      'i'
    );
    const matches = [];
    state.rows.forEach((row) => {
      // make one long string of searchable things, and test that one time
      const testString = `${row.first_name} ${row.last_name} ${row.email}`;
      if (searchExp.test(testString)) {
        matches.push(row);
      }
    });
    setState({ ...state, filteredRows: matches });
  };

  const fetchUsers = (usersToFetch) => {
    const args = usersToFetch === 'inactive' ? '?show-inactive=true' : '';
    axios.get(`/api/users${args}`).then((response) => {
      setState({
        ...state,
        rows: response.data.result,
        filteredRows: response.data.result,
        usersToFetch
      });
    });
  };

  const handleIntegrationChange = (event) => {
    let newIntegrations = [...state.integrationsForNewUsers];

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
    setState({
      ...state,
      integrationsForNewUsers: [...new Set(newIntegrations)]
    });
  };

  const handleCloseInviteModal = () => {
    // clear state
    setState({
      ...state,
      emailsToInvite: [],
      roleForNewUsers: 'user',
      integrationsForNewUsers: []
    });

    // close modal
    setinviteModalOpen(false);
  };

  const inviteNewUsers = () => {
    setState({ ...state, invitationsAreSending: true });

    const payload = {
      emails: state.emailsToInvite,
      role: state.roleForNewUsers,
      integrations: state.integrationsForNewUsers
    };

    axios
      .post('/api/auth/invite-user', payload)
      .then(() => {
        // growl success
      })
      .catch(() => {
        // growl fail
      })
      .finally(() => {
        // close modal either way
        handleCloseInviteModal();
        setState({ ...state, invitationsAreSending: false });
      });
  };

  const validateEmail = (email) => {
    // https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
    const re = new RegExp(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g
    );
    return re.test(email.toLowerCase());
  };

  const handleInviteEmailChange = (event, emails) => {
    // validate all emails
    const okayEmails = emails.filter((email) => validateEmail(email));
    const brokenEmails = emails.filter((email) => !validateEmail(email));

    if (brokenEmails.length) {
      Notify.warning(
        `The following emails are invalid and will not be invited: ${brokenEmails.join(
          ', '
        )}.`,
        { timeout: 6000 }
      );
    }

    // update the state with properly-validated emails
    setState({ ...state, emailsToInvite: okayEmails });
  };

  useEffect(() => {
    // load users the first time
    fetchUsers('active');
  }, []);

  return (
    <>
    <div className="users">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleViewSidebar} />
      <div>
        <h1 style={{paddingTop: "5vh"}}>
          <strong>Users:</strong>
        </h1>
      </div>
    </div>
    <Dialog
    open={inviteModalOpen}
    onClose={() => setinviteModalOpen(false)}
    aria-labelledby="form-dialog-title"
  >
    <DialogTitle id="form-dialog-title">Invite Users</DialogTitle>
    <DialogContent>
      <DialogContentText>
        All emails entered will be invited to create an account with the
        access role and integrations specified. Press enter after each
        email.
      </DialogContentText>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Autocomplete
            multiple
            fullWidth
            id="tags-filled"
            options={[]}
            defaultValue={[]}
            onChange={handleInviteEmailChange}
            freeSolo
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Emails"
                placeholder="Press enter after each email..."
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Role"
            name="role"
            onChange={(event) =>
              setState({ ...state, roleForNewUsers: event.target.value })
            }
            select
            SelectProps={{ native: true }}
            value={state.roleForNewUsers}
            variant="outlined"
          >
            {roles.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <Typography color="textPrimary" gutterBottom variant="h6">
            Integrations
          </Typography>
          {integrations.map((integration) => (
            <FormControlLabel
              key={integration}
              control={
                <Checkbox
                  color="primary"
                  name={integration.toLowerCase()}
                  checked={state.integrationsForNewUsers.includes(
                    integration.toLowerCase()
                  )}
                  onChange={handleIntegrationChange}
                />
              }
              label={integration}
            />
          ))}
        </Grid>
      </Grid>
    </DialogContent>
    <DialogActions>
      <Button
        onClick={handleCloseInviteModal}
        color="primary"
        disabled={state.invitationsAreSending}
      >
        Cancel
      </Button>
      <Button
        onClick={inviteNewUsers}
        color="primary"
        disabled={
          state.invitationsAreSending || state.emailsToInvite.length == 0
        }
      >
        Send Invitations
      </Button>
    </DialogActions>
  </Dialog>
  <Box
    sx={{
      backgroundColor: 'background.default',
      minHeight: '100%',
      py: 3
    }}
  >
    <Container maxWidth={false}>
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <Button
            color="primary"
            variant="contained"
            onClick={() => setinviteModalOpen(true)}
          >
            Invite Users
          </Button>
        </Box>
        <Box sx={{ mt: 3 }}>
          <Card>
            <CardContent >
              <Grid container spacing={3}>
                <Grid item md={6} sm={6} xs={12}>
                  <TextField
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SvgIcon fontSize="small" color="action">
                            <SearchIcon />
                          </SvgIcon>
                        </InputAdornment>
                      )
                    }}
                    placeholder="Search users by name or email"
                    variant="outlined"
                    onChange={handleRowsFilter}
                  />
                </Grid>
                <Grid item md={6} sm={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Showing"
                    name="usersToShow"
                    onChange={(event) => fetchUsers(event.target.value)}
                    select
                    SelectProps={{ native: true }}
                    value={state.usersToFetch}
                    variant="outlined"
                  >
                    <option key="active" value="active">
                      Active Users
                    </option>
                    <option key="inactive" value="inactive">
                      Inactive Users
                    </option>
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Box>
      <Box sx={{ pt: 3 }}>
        <Card>
          <PerfectScrollbar>
            <Box sx={{ minWidth: 1050 }}>
              <TableContainer>
                <Table
                  aria-labelledby="tableTitle"
                  size="medium"
                  aria-label="users table"
                >
                  <EnhancedTableHead
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                    rowCount={state.filteredRows.length}
                  />
                  <TableBody>
                    {stableSort(
                      state.filteredRows,
                      getComparator(order, orderBy)
                    )
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((row, index) => {
                        const labelId = `enhanced-table-checkbox-${index}`;

                        return (
                          <TableRow
                            hover
                            onClick={(event) => handleClick(event, row.id)}
                            tabIndex={-1}
                            key={row.id}
                          >
                            <TableCell
                              component="th"
                              id={labelId}
                              scope="row"
                            >
                              {row.first_name}
                            </TableCell>
                            <TableCell>{row.last_name}</TableCell>
                            <TableCell>{row.email}</TableCell>
                            <TableCell>{row.role}</TableCell>
                            <TableCell>
                              {row.is_active.toString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={state.filteredRows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          </PerfectScrollbar>
        </Card>
      </Box>
    </Container>
  </Box>
</>
);
};


