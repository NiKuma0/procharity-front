/* eslint-disable no-console */
import React from 'react';
import { makeStyles, AppBar, Toolbar, IconButton, Drawer, Divider, List } from '@material-ui/core';
import clsx from 'clsx';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import MenuIcon from '@material-ui/icons/Menu';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { MainListItems, SecondaryListItems } from '../NavigationItems/NavigationItems';

const drawerWidth = 250;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24,
    // keep right padding when drawer closed
  },
  drawerPosition: {
    position: 'fixed',
    top: '0',
    left: '0',
    height: '100%',
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    position: 'fixed',
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
    marginTop: 100,
    '& .quill': {
      width: '90%',
    },
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  richTextEditor: {
    maxWidth: '60%',
  },

  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
  authFormTitle: {
    width: '100%',
    textAlign: 'center',
    fontSize: '2rem',
    lineHeight: '2rem',
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  buttonThemeContainer: {
    paddingRight: 10,
    position: 'absolute',
    right: '0',
  },
}));
interface HeaderProps {
  handleDrawerOpen: () => void;
  handleDrawerClose: () => void;
  handleSetTheme: () => void;
  removeToken: () => void;
  isDark: boolean;
  isMenuOpen: boolean;
  handleResetErrors: () => void;
}

const Header: React.FC<HeaderProps> = ({
  handleDrawerOpen,
  handleDrawerClose,
  isMenuOpen,
  handleSetTheme,
  isDark,
  removeToken,
  handleResetErrors,
}) => {
  const classes = useStyles();
  const history = useHistory();

  const matchLogin = useRouteMatch('/')?.isExact ?? false;

  const matchRegister = useRouteMatch('/register/:id')?.isExact ?? false;
  const matchReset = useRouteMatch('/reset_password')?.isExact ?? false;

  const handleLogout = () => {
    removeToken();
    history.push('/');
  };

  return (
    <>
      {!(matchLogin || matchRegister || matchReset) ? (
        <>
          <AppBar position="absolute" className={clsx(classes.appBar, isMenuOpen && classes.appBarShift)}>
            <Toolbar className={classes.toolbar}>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="isMenuOpen drawer"
                onClick={handleDrawerOpen}
                className={clsx(classes.menuButton, isMenuOpen && classes.menuButtonHidden)}>
                <MenuIcon />
              </IconButton>
              <div className={classes.appBarSpacer} />
              <IconButton onClick={handleSetTheme}>{isDark ? <Brightness4Icon /> : <Brightness7Icon />}</IconButton>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="permanent"
            classes={{
              paper: clsx(classes.drawerPaper, !isMenuOpen && classes.drawerPaperClose),
              root: classes.drawerPosition,
            }}
            open={isMenuOpen}>
            <div className={classes.toolbarIcon}>
              <IconButton onClick={handleDrawerClose}>
                <ChevronLeftIcon />
              </IconButton>
            </div>
            <Divider />
            <List>
              <MainListItems handleResetErrors={handleResetErrors} />
            </List>
            <Divider />

            <List>
              <SecondaryListItems handleLogout={handleLogout} />
            </List>
          </Drawer>
        </>
      ) : (
        <div className={classes.headerContainer}>
          <h1 className={classes.authFormTitle}>ProCharity</h1>
          <div className={classes.buttonThemeContainer}>
            <IconButton onClick={handleSetTheme}>{isDark ? <Brightness4Icon /> : <Brightness7Icon />}</IconButton>
          </div>
        </div>
      )}
    </>
  );
};
export default Header;
