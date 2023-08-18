import React, { useContext, useState, useEffect } from "react";
import { InteractionContext } from "common/InteractionContext";
import { DataContext } from "common/DataContext";
import { AuthContext } from "common/AuthContext";
import Sidebar from "../sidebar/sidebar";
import { Box, Button, Container } from '@mui/material';
import "./styles.css";

export const Software = () => {
  const {} = useContext(InteractionContext);
  const {} = useContext(DataContext);
  const { sidebarOpen, handleSetSidebarState } = useContext(DataContext);
  const { refresh, user } = useContext(AuthContext);
  const handleViewSidebar = () => {
    handleSetSidebarState();
  };
  return (
    <>
    <div className='software'>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleViewSidebar} />
      <div>
      <h1 style={{paddingTop: "5vh"}}>Software:</h1>
      </div>
    </div>

    <Box
    sx={{
      display: 'flex',
      backgroundColor: 'background.default',
      minHeight: '100%',
      py: 3,
      span: '100%',
    }}
  >
    <Container
      sx={{
        justifyContent: 'center',
        display: 'flex',
        minHeight: '40vh',
        span: '100%'
      }}
      maxWidth="lg"
    >
      <Button
        onClick={() => {
          window.open('https://mikro.kaart.com/', '_blank');
        }}
        sx={{
          maxHeight: '9vh',
          minHeight: '7vh',
          minWidth: '7vw',
          maxWidth: '9vw',
          marginTop: '5%',
          marginLeft: '5%',
          border: '2px solid #f4753d',

          '&:hover': {
            backgroundColor: '#f4753d',
            color: 'white'
          }
        }}
      >
        Mikro
      </Button>
      <Button
        onClick={() => {
          window.open('https://viewer.kaart.com/', '_blank');
        }}
        sx={{
          maxHeight: '9vh',
          minHeight: '7vh',
          minWidth: '7vw',
          maxWidth: '9vw',
          marginTop: '5%',
          marginLeft: '5%',
          border: '2px solid #f4753d',

          '&:hover': {
            backgroundColor: '#f4753d',
            color: 'white'
          }
        }}
      >
        Viewer
      </Button>
      <Button
        onClick={() => {
          window.open('https://gem.kaart.com/', '_blank');
        }}
        sx={{
          maxHeight: '9vh',
          minHeight: '7vh',
          minWidth: '7vw',
          maxWidth: '9vw',
          marginTop: '5%',
          marginLeft: '5%',
          border: '2px solid #f4753d',

          '&:hover': {
            backgroundColor: '#f4753d',
            color: 'white'
          }
        }}
      >
        GEM
      </Button>
    </Container>
  </Box>
  </>
  );
};