import { ReactElement } from "react";
import {
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography,
  makeStyles,
  createStyles,
} from "@material-ui/core";
import { GetPostQuery, ListPostsQuery, Post } from "../../API";
import { graphqlOperation, withSSRContext } from "aws-amplify";
import { GraphQLAPIClass } from "@aws-amplify/api-graphql";
import { getPost, listPosts } from "../../graphql/queries";
import { GetStaticPaths, GetStaticProps } from "next";
import { CustomGraphQLResponse } from "../../types/CustomGraphQLResponse";
import { ParsedUrlQuery } from "querystring";
import { useRouter } from "next/router";

interface Props {
  post: Post;
}

function IndividualPost({ post }: Props): ReactElement {
  const classes = useStyles();
  const router = useRouter();

  if (router.isFallback) {
    return (
      <Container maxWidth="md" className={classes.root}>
        <Grid
          container
          className={classes.loaderGridContainer}
          direction="column"
          alignItems="center"
          justifyContent="center"
        >
          <Grid item xs={6}>
            <CircularProgress size={240} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" className={classes.root}>
      <Grid container>
        <Grid item xs={12}>
          {!post && <CircularProgress size={72} />}
          {post && (
            <Paper className={classes.postPaper}>
              <Grid container>
                <Typography variant="body2">
                  Posted by <b>{post.owner}</b> at{" "}
                  {new Date(post.createdAt).toLocaleString("en-IN")}
                </Typography>
                <Grid item xs={12}>
                  <Typography variant="h2">{post.title}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">{post.content}</Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default IndividualPost;

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: theme.spacing(2),
    },
    loaderGridContainer: {
      height: "70vh",
    },
    postPaper: {
      padding: theme.spacing(2),
    },
  })
);

interface CustomUrlQuery extends ParsedUrlQuery {
  postId: string;
}

export const getStaticProps: GetStaticProps<Props, CustomUrlQuery> = async ({
  params,
}) => {
  const SSR_API = withSSRContext().API as GraphQLAPIClass;
  const post = (await SSR_API.graphql({
    query: getPost,
    variables: { id: params.postId },
  })) as CustomGraphQLResponse<GetPostQuery>;

  return {
    props: {
      post: post.data.getPost,
    },
    revalidate: 10,
  };
};

export const getStaticPaths: GetStaticPaths<CustomUrlQuery> = async () => {
  const SSR_API = withSSRContext().API as GraphQLAPIClass;
  const allPosts = (await SSR_API.graphql(
    graphqlOperation(listPosts)
  )) as CustomGraphQLResponse<ListPostsQuery>;

  if (allPosts.errors) {
    return {
      fallback: false,
      paths: [],
    };
  }

  const paths: { params: CustomUrlQuery }[] = allPosts.data.listPosts.items.map(
    (post) => ({
      params: {
        postId: post.id,
      },
    })
  );

  return {
    fallback: "blocking",
    paths,
  };
};
