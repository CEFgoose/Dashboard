///// IMPORTS /////
import {
  Card,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Modal,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import close_icon from "../../images/close_icon.png";
import {
  Button,
  ButtonLabel,
  CloseButtonImg,
  Container,
  RegisterButton,
} from "./styles";
import { Input, TextArea } from "./styles";
// STYLED COMPONENTS

export const TopDiv = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
}));

export const CardMediaStyle = styled("div")(({ theme }) => ({
  display: "flex",
  position: "relative",
  justifyContent: "center",
  paddingTop: "3vh",
  "&:before": {
    top: 0,
    zIndex: 9,
    content: "''",
    width: "100%",
    height: "100%",
    position: "absolute",
    backdropFilter: "blur(3px)",
    WebkitBackdropFilter: "blur(3px)", // Fix on Mobile
    backgroundColor: "#f4753c",
    fontWeight: "400",
  },
}));

export const TableCard = styled(Card)(() => ({
  width: "100%",
  marginLeft: "0vw",
}));

export const MainDiv = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
}));

export const ModalWrapper = styled("div")(() => ({
  position: "fixed",
  top: "50%",
  left: "55%",
  backgroundColor: "white",
  backdropFilter: "blur(3px)",
  WebkitBackdropFilter: "blur(3px)",
  borderRadius: "6px",
  width: "50%",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  transform: "translate(-50%, -50%)",
}));

export const ButtonDiv = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  textAlign: "center",
  justifyContent: "center",
}));

// COMPONENTS

//GENERIC CONFIRM & CANCEL BUTTONS - USED ON MOST VIEWER MODALS - CHANGE TEXT AND ACTION PROP FOR EACH BUTTON
export const CancelConfirmButtons = (props) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        textAlign: "center",
        justifyContent: "center",
      }}
    >
      <CancelButton
        cancel_text={props.cancel_text}
        cancel_action={props.cancel_action}
      />
      <ConfirmButton
        confirm_text={props.confirm_text}
        confirm_action={props.confirm_action}
      />
    </div>
  );
};

// GENERAL CANCEL BUTTON //
export const CancelButton = (props) => {
  return <Button onClick={props.cancel_action}>{props.cancel_text}</Button>;
};

// GENERAL CONFIRM BUTTON //
export const ConfirmButton = (props) => {
  return (
    <Button onClick={(e) => props.confirm_action(e)}>
      {props.confirm_text}
    </Button>
  );
};

// GENERAL SECTION TITLE
export const SectionTitle = (props) => {
  return (
    <Typography
      variant="h5"
      align="center"
      style={{
        paddingLeft: "1vw",
        paddingRight: "1vw",
        marginBottom: "1vh",
        marginTop: "2vh",
      }}
      sx={{ mt: 6 }}
    >
      {props.title_text}
    </Typography>
  );
};

// GENERAL SECTION SUBTITLE
export const SectionSubtitle = (props) => {
  return (
    <Typography
      variant="body1"
      align="center"
      style={{
        paddingLeft: "1vw",
        paddingRight: "1vw",
        marginBottom: "1vh",
        marginTop: "1vh",
      }}
      sx={{ mt: 6 }}
    >
      {props.subtitle_text}
    </Typography>
  );
};

// GENERAL CLOSE MODAL BUTTON
export const CloseButton = (props) => {
  return (
    <img
      src={close_icon}
      style={{
        position: "relative",
        left: "95%",
        width: "2%",
      }}
      alt={"close_button"}
      onClick={props.close_action}
    ></img>
  );
};

// TITLE DIV
export const TitleDiv = (props) => {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginLeft: "0",
        marginBottom: "0vh",
        marginRight: "0",
      }}
    >
      <h3>{props.text}</h3>
    </div>
  );
};

//GENERAL STYLED BUTTON

export const StyledButton = (props) => {
  return (
    <Button
      onClick={props.button_action}
      style={{
        boxShadow: "1px 1px 6px 2px gray",
        textAlign: "center",
        lineHeight: "2.0em",
      }}
    >
      <ButtonLabel>{props.button_text}</ButtonLabel>
    </Button>
  );
};

//BUTTON DIV COMPONENT
export const ButtonDivComponent = (props) => {
  return (
    <Container>
      {props.page !== "images" && props.role === "admin" ? (
        <StyledButton button_action={props.handleAddOpen} button_text={"Add"} />
      ) : (
        <></>
      )}
      {props.role === "admin" ? (
        <StyledButton
          button_action={props.handleDeleteOpen}
          button_text={"Delete"}
        />
      ) : (
        <></>
      )}
      <StyledButton
        button_action={props.modify_action}
        button_text={props.role === "admin" ? props.modifyText : props.userText}
      />
    </Container>
  );
};

//TABLE HEADER COMPNENT
export const ListHead = (props) => {
  // order,
  //TABLE HEADER COMPONENT RENDER
  return (
    <TableHead>
      <TableRow style={{ margin: "0", textAlign: "center" }}>
        {props.headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            style={{
              width: "10vw",
              textAlign: "center",
              fontSize: props.fontSize,
            }}
          >
            <TableSortLabel
              direction={props.operator === true ? "desc" : "asc"}
              onClick={(e) => props.sortOrgProjects(headCell.label, "asc")}
            >
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export const ProjectHead = (props) => {
  //PROJECTS TABLE HEADER COMPONENT RENDER
  //EXCLUDES CHECKBOX CELL
  return (
    <TableHead>
      <TableRow style={{ margin: "0", textAlign: "center" }}>
        {props.headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            style={{
              width: "9vw",
              textAlign: "center",
              fontSize: props.fontSize,
            }}
          >
            <TableSortLabel hideSortIcon direction={"asc"}>
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};


export const ConfirmModalCommon = (props) => {
  const modal_body = (
    <ModalWrapper>
      <Card>
        <Typography
          variant="h5"
          align="center"
          style={{ marginLeft: "1vw", marginRight: "1vw" }}
        >
          {props.interrogative}
        </Typography>
        <Divider style={{ marginTop: "1vh" }} />
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            style={{ marginLeft: "1vw", marginRight: "1vw", textAlign: "center" }}
            onClick={() => props.button_1_action()}
          >
            {props.button_1_text}
          </Button>
          <Button
            style={{ marginLeft: "1vw", marginRight: "1vw", textAlign: "center" }}
            onClick={() => props.button_2_action()}
          >
            {props.button_2_text}
          </Button>
        </div>
      </Card>
    </ModalWrapper>
  );
  //COMPONENT RENDER
  return (
    <Modal
      open={props.modal_open}
      onClose={props.handleOpenCloseModal}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      {modal_body}
    </Modal>
  );
};
