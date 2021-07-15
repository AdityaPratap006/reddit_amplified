import { createStyles, makeStyles, Container, Grid } from "@material-ui/core";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { ListPostsQuery, Post } from "../API";
import PostPreview from "../components/PostPreview";
import { useUser } from "../context/AuthContext";
import { listPosts } from "../graphql/queries";

export default function Home() {
  const classes = useStyles();
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchPostsFromApi = async () => {
      const allPosts = (await API.graphql({ query: listPosts })) as {
        data: ListPostsQuery;
        errors: { errorType: string; message: string; errorInfo: any }[];
      };

      if (allPosts.data) {
        setPosts(allPosts.data.listPosts.items);
      } else {
        setError("Couldn't get posts");
        console.log(allPosts.errors);
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

  return (
    <Container maxWidth="md" className={classes.root}>
      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item key={post.id} xs={12}>
            <PostPreview post={post} />
          </Grid>
        ))}
      </Grid>
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
