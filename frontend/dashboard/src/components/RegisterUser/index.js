///// IMPORTS /////
import React, { useState } from "react";
import { poster } from "calls";
import useToggle from "../../hooks/useToggle.js";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ConfirmButton,
  SectionSubtitle,
} from "../commonComponents/commonComponents.js";

import {
  RegisterPage,
  RegisterForm,
  Title,
  RegisterInput,
  NameInput,
} from "./styles.js";

export const RegisterUser = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setlastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [org, setOrg] = useState("");
  const [responseMessage, setResponseMessage] = useState(null);
  const [responseCode, setResponseCode] = useState(null);
  const [redirect, toggleRedirect] = useToggle(false);

  async function RegisterUserSSO() {
    let url = "register_user";
    let outpack = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      org: org,
    };
    await poster(outpack, url).then((response) => {
      let code = response.code;
      setResponseMessage(response.message);
      setResponseCode(code);
    });
  }

  ///// COMPONENT RENDER /////
  return (
    <>
      <RegisterPage>
        <RegisterForm>
          {/* <RegisterImage src={kaartLogo} alt="Kaart Logo"/> */}
          <Title>Sign Up Now</Title>
          <NameInput
            type="text"
            name="First Name"
            placeholder="First Name"
            onChange={(e) => {
              setFirstName(e.target.value);
            }}
          />
          <NameInput
            type="text"
            name="Last Name"
            placeholder="Last Name"
            onChange={(e) => {
              setlastName(e.target.value);
            }}
          />
          <RegisterInput
            type="text"
            name="Email"
            placeholder="Email"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <RegisterInput
            type="text"
            name="Password"
            placeholder="Password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <RegisterInput
            type="text"
            name="Organization"
            placeholder="Organization"
            onChange={(e) => {
              setOrg(e.target.value);
            }}
          />
          {responseCode && responseCode ? (
            <>
              <SectionSubtitle
                style={{ marginTop: "2vh" }}
                subtitle_text={responseMessage}
              />
            </>
          ) : (
            <></>
          )}
        </RegisterForm>
        <ConfirmButton
          confirm_text={
            responseCode &&
            (responseCode === 0 || responseCode === 1 || responseCode === 2)
              ? "Log In"
              : responseCode === 3
              ? "Activate Account"
              : "Submit"
          }
          confirm_action={
            responseCode === 0
              ? toggleRedirect
              : responseCode === 1
              ? toggleRedirect
              : responseCode === 2
              ? toggleRedirect
              : RegisterUserSSO
          }
        />
      </RegisterPage>
      {!redirect ? <></> : <Navigate push to="/login" />}
    </>
  );
};
