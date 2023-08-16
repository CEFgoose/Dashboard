import React ,{useState, useContext} from "react";
import { DataContext } from "common/DataContext";
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
  const { history } = useContext(DataContext);
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
                onClick={(e)=>history('/login')}
              >
                Login
              </Button>
            </div>

      </div>
        
    </>
  );
}

