import React ,{useState} from "react";
import { Navigate } from "react-router-dom";
import useToggle from "hooks/useToggle";
import { 
  styled, 
  Button,
  Box,
  Container,
  Typography,
  Stack,
  StackProps,
} from "@mui/material";




export const LandingPage = (props) =>{
  const [redirect, setRedirect] = useToggle(false);
  const handleSetRedirect=()=>{
    setRedirect()
  }
  return (
    <>
      <div style={{backgroundColor:'darkGrey',width:'100%',height:'100%'}}>

            <div>


                <Typography
                  component="span"
                  variant="h1"
                  sx={{ color: "primary.main" }}
                >
                  Tabula Rasa
                </Typography>

            </div>

            <div>
              <Typography sx={{ color: "common.white" }}>
                A Boilerplate React & Flask app with database & single sign on integration
              </Typography>
            </div>

            <div>
              <Button
                size="large"
                variant="contained"
                onClick={()=>handleSetRedirect()}
              >
                Login
              </Button>
            </div>

      </div>
      {!redirect ? <></> : <Navigate push to="/login" />}
    </>
  );
}

