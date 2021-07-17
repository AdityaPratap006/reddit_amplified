import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import AccountCircle from "@material-ui/icons/AccountCircle";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import { useUser } from "../context/AuthContext";
import { Button, Tooltip } from "@material-ui/core";
import { Auth } from "aws-amplify";
import Link from "next/link";
import AddIcon from "@material-ui/icons/Add";

export default function Header(): React.ReactElement {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { user, setUser } = useUser();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    try {
      await Auth.signOut();
      setUser(null);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={classes.root}>
      <AppBar position="fixed" color="inherit">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Link href="/">
            <Typography variant="h6" className={classes.title}>
              RedditAmplified
            </Typography>
          </Link>
          {user && (
            <div className={classes.right}>
              <Link href="/create">
                <Tooltip title="Create Post">
                  <IconButton color="inherit" aria-label="add">
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </Link>

              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={open}
                onClose={handleClose}
              >
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          )}
          {!user && (
            <div className={classes.right}>
              <Link href="/login">
                <Button color="secondary">Login</Button>
              </Link>

              <Link href="/signup">
                <Button color="primary" variant="contained">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      cursor: "pointer",
    },
    link: {
      textDecoration: "none",
      color: theme.palette.text.primary,
    },
    right: {
      marginLeft: "auto",
    },
  })
);
