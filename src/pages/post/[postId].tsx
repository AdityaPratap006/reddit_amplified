import { ReactElement } from "react";
import {
  CircularProgress,
  Container,
  Grid,
  makeStyles,
  createStyles,
  Typography,
} from "@material-ui/core";
import { GetPostQuery, ListPostsQuery, Post } from "../../API";
import { graphqlOperation, withSSRContext } from "aws-amplify";
import { GraphQLAPIClass } from "@aws-amplify/api-graphql";
import { getPost, listPosts } from "../../graphql/queries";
import { GetStaticPaths, GetStaticProps } from "next";
import { CustomGraphQLResponse } from "../../types/CustomGraphQLResponse";
import { ParsedUrlQuery } from "querystring";
import { useRouter } from "next/router";
import PostPreview from "../../components/PostPreview";
import CommentCard from "../../components/CommentCard";

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

  console.log(post);
  return (
    <Container maxWidth="md" className={classes.root}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          {!post && <CircularProgress size={72} />}
          {post && <PostPreview post={post} />}
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">Comments</Typography>
        </Grid>
        <Grid item xs={12} container spacing={1}>
          {post?.comments?.items?.map((comment) => (
            <Grid item xs={12} key={comment.id}>
              <CommentCard comment={comment} />
            </Grid>
          ))}
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
