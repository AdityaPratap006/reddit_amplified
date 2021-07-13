import React, { FC, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Button,
  Grid,
  TextField,
  Snackbar,
  Container,
  Paper,
  CircularProgress,
} from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import { Auth } from "aws-amplify";
import { CognitoUser } from "@aws-amplify/auth";
import { useUser } from "../context/AuthContext";
import { useRouter } from "next/router";

interface Props {}

interface IFormInput {
  username: string;
  password: string;
}

const Login: FC<Props> = () => {
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");
  const { setUser } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<IFormInput>({
    mode: "all",
  });

  const router = useRouter();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    console.log("Submitted the form!");
    console.log(data);

    try {
      const amplifyUser = await signInWithUsernameAndPassword(data);
      setUser(amplifyUser);
      if (amplifyUser) {
        router.push("/");
      } else {
        throw new Error("Something went wrong :(");
      }
    } catch (error) {
      setLoginError((error as Error).message);
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarOpen(false);
    setLoginError("");
  };

  return (
    <Container style={{ padding: "2rem" }} maxWidth="xl">
      <Grid container alignItems="center" justifyContent="center">
        <Grid item xs={12} sm={10} md={8} lg={6} xl={4}>
          <Paper style={{ padding: "2rem" }}>
            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="username"
                    type="text"
                    label="Username"
                    variant="outlined"
                    {...register("username", {
                      required: {
                        value: true,
                        message: "Please enter a username",
                      },
                      minLength: {
                        value: 3,
                        message: "Username should be between 3-16 characters",
                      },
                      maxLength: {
                        value: 16,
                        message: "Username should be between 3-16 characters",
                      },
                    })}
                    error={!!errors.username}
                    helperText={errors.username?.message}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="password"
                    type="password"
                    label="Password"
                    variant="outlined"
                    {...register("password", {
                      required: {
                        value: true,
                        message: "Please enter a password",
                      },
                      minLength: {
                        value: 8,
                        message: "Please enter a stronger password",
                      },
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                </Grid>

                <Grid item xs={12} style={{ marginTop: 16 }}>
                  <Grid container justifyContent="center">
                    {!isSubmitting && (
                      <Button
                        variant="contained"
                        type="submit"
                        disabled={!isValid}
                        color="primary"
                      >
                        Login
                      </Button>
                    )}
                    {isSubmitting && <CircularProgress />}
                  </Grid>
                </Grid>
              </Grid>

              <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ horizontal: "right", vertical: "top" }}
              >
                <Alert onClose={handleSnackbarClose} severity="error">
                  {loginError}
                </Alert>
              </Snackbar>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Login;

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

async function signInWithUsernameAndPassword({
  username,
  password,
}: IFormInput): Promise<CognitoUser> {
  try {
    const user = await Auth.signIn(username, password);
    console.log("logged in successfuly as user: ", user);
    return user;
  } catch (error) {
    console.log("error logging in: ", error);
    throw error;
  }
}
