import {
  createStyles,
  makeStyles,
  Container,
  Grid,
  Snackbar,
} from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { ListPostsQuery, Post } from "../API";
import PostPreview from "../components/PostPreview";
import { useUser } from "../context/AuthContext";
import { listPosts } from "../graphql/queries";
import { CustomGraphQLResponse } from "../types/CustomGraphQLResponse";

export default function Home() {
  const classes = useStyles();
  const { user } = useUser();
  const [posts, setPosts] = useState<(Post | null)[]>([]);
  const [error, setError] = useState<string>();
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchPostsFromApi = async () => {
      try {
        const allPosts = (await API.graphql({
          query: listPosts,
        })) as CustomGraphQLResponse<ListPostsQuery>;

        if (allPosts.data) {
          setPosts(allPosts.data.listPosts?.items || []);
        } else if (allPosts.errors) {
          console.log(allPosts.errors);
          throw new Error(
            `${allPosts.errors[0].errorType}: ${allPosts.errors[0].message}`
          );
        }
      } catch (error) {
        console.log(error);
        setError("Couldn't get posts");
        setSnackbarOpen(true);
      }
    };

    fetchPostsFromApi();
  }, []);

  useEffect(() => {
    console.log("USER: ", user);
  }, [user]);

  useEffect(() => {
    console.log("POSTS: ", posts);
  }, [posts]);

  useEffect(() => {
    console.log("ERROR: ", error);
  }, [error]);

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarOpen(false);
    setError("");
  };

  return (
    <Container maxWidth="md" className={classes.root}>
      <Grid container spacing={3}>
        {posts.map((post) =>
          !post ? null : (
            <Grid item key={post.id} xs={12}>
              <PostPreview post={post} />
            </Grid>
          )
        )}
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <Alert onClose={handleSnackbarClose} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: theme.spacing(2),
    },
  })
);

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
