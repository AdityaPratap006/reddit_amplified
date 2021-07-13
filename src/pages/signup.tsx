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
  email: string;
  password: string;
  code: string;
}

const SignUp: FC<Props> = () => {
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [signUpError, setSignUpError] = useState<string>("");
  const { setUser } = useUser();
  const [showCode, setShowCode] = useState<boolean>(false);

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
      if (showCode) {
        const amplifyUser = await confirmSignUp(data);
        setUser(amplifyUser);
        if (amplifyUser) {
          router.push("/");
        } else {
          throw new Error("Something went wrong :(");
        }
      } else {
        await signUpWithEmailAndPassword(data);
        setShowCode(true);
      }
    } catch (error) {
      setSignUpError((error as Error).message);
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
    setSignUpError("");
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
                    id="email"
                    type="email"
                    label="Email"
                    variant="outlined"
                    {...register("email", {
                      required: {
                        value: true,
                        message: "Please enter an email",
                      },
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
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
                {showCode && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="code"
                      type="text"
                      label="Verification Code"
                      variant="outlined"
                      {...register("code", {
                        required: {
                          value: true,
                          message: "Please enter the verification code",
                        },
                        minLength: {
                          value: 6,
                          message:
                            "Your verification code is 6 characters long",
                        },
                        maxLength: {
                          value: 6,
                          message:
                            "Your verification code is 6 characters long",
                        },
                      })}
                      error={!!errors.username}
                      helperText={errors.username?.message}
                    />
                  </Grid>
                )}
                <Grid item style={{ marginTop: 16 }} xs={12}>
                  <Grid container justifyContent="center">
                    {!isSubmitting && (
                      <Button
                        variant="contained"
                        type="submit"
                        disabled={!isValid}
                        color="primary"
                      >
                        {showCode ? "Confirm Code" : "Sign Up"}
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
                  {signUpError}
                </Alert>
              </Snackbar>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SignUp;

async function signUpWithEmailAndPassword(
  data: IFormInput
): Promise<CognitoUser> {
  const { email, password, username } = data;
  try {
    const { user } = await Auth.signUp({
      username,
      password,
      attributes: {
        email,
      },
    });
    console.log("signed up as user: ", user);
    return user;
  } catch (error) {
    console.log("error signing up:", error);
    throw error;
  }
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

async function confirmSignUp({
  username,
  code,
  password,
}: IFormInput): Promise<CognitoUser> {
  try {
    await Auth.confirmSignUp(username, code);
    const user = await Auth.signIn(username, password);
    console.log("signed in successfuly as user: ", user);
    return user;
  } catch (error) {
    console.log("error confirming sign-up: ", error);
    throw error;
  }
}
