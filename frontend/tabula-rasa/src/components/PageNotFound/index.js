import { Box, Container, Typography } from "@mui/material";
import { StyledButton } from "components/commonComponents/commonComponents";
import NotFound from "images/404.jpg";
import { NavLink, Navigate, useNavigate } from "react-router-dom";
export const PageNotFound = () => {

  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate("/login", {replace: true });
  };
  
  return (
  <>
    <div>
      <title>404 | Kaart SSO</title>
    </div>
    <Box
      sx={{
        backgroundColor: "background.default",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="md">
        <Typography align="center" color="textPrimary" variant="h1">
          <strong>Error:</strong>
        </Typography>
        <Typography align="center" color="textPrimary" variant="h3">
          The page you are looking for isn’t here
        </Typography>
        <Typography align="center" color="textPrimary" variant="subtitle2">
          You either tried some shady route or you came here by mistake.
          Whichever it is, try using the navigation
        </Typography>
        <div
          style={{
            position: 'relative',
            display: 'flex',           
            alignContent: 'center',
            alignItems: 'center', 
            justifyContent: 'center',
                      }}>
        <StyledButton
          button_text={"Dashboard"}
          button_action={handleButtonClick }
        ></StyledButton>
        </div>
        <Box sx={{ textAlign: "center" }}>
          <figure
            style={{ marginTop: 50, display: "inline-block", maxWidth: "100%" }}
          >
            <img
              alt="Under development"
              src={NotFound}
              style={{ maxWidth: "100%", width: 560 }}
            />
            <figcaption
              style={{
                textAlign: "center",
                fontSize: "10px",
                marginTop: "10px",
              }}
            >
              <a href="https://www.freepik.com/free-vector/404-error-with-landscape-concept-illustration_20602785.htm#query=404%20page&position=2&from_view=keyword&track=ais">
                Image by storyset
              </a>{" "}
              on Freepik
            </figcaption>
          </figure>
        </Box>
      </Container>
    </Box>
  </>
  );
            };
