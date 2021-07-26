import {
  Card,
  CardContent,
  createStyles,
  Grid,
  IconButton,
  makeStyles,
  Typography,
  useMediaQuery,
  ButtonBase,
} from "@material-ui/core";
import ArrowUpIcon from "@material-ui/icons/ArrowUpwardRounded";
import ArrowDownIcon from "@material-ui/icons/ArrowDownwardRounded";
import NextImage from "next/image";
import { useRouter } from "next/router";
import { Post } from "../API";
import { useEffect, useState } from "react";
import { Storage } from "aws-amplify";

interface Props {
  post: Post;
}

const PostPreview = ({ post }: Props) => {
  const matches = useMediaQuery("(max-width: 960px)");
  const classes = useStyles({ matches })();
  const router = useRouter();
  const [postImage, setPostImage] = useState<string>();

  useEffect(() => {
    const getImageFromStorage = async () => {
      if (!post.image) {
        return;
      }
      try {
        const signedURL = await Storage.get(post.image);
        console.log("Found the image: ", signedURL);
        setPostImage(signedURL as string);
      } catch (error) {
        console.log("Error getting image: ", error);
      }
    };

    getImageFromStorage();
  }, []);

  const navigateToIndividualPost = () => {
    router.push(`/post/${post.id}`);
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Grid container spacing={2} className={classes.mainGrid}>
          <Grid
            container
            spacing={2}
            item
            sm={12}
            md={1}
            className={classes.votes}
          >
            <Grid
              container
              item
              xs={2}
              md={12}
              alignItems="center"
              justifyContent="center"
            >
              <IconButton color="primary" size="small">
                <ArrowUpIcon className={classes.voteBtnIcon} />
              </IconButton>
            </Grid>
            <Grid
              container
              item
              xs={2}
              md={12}
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="body2" align="center">
                {(post.upvotes - post.downvotes).toString()}
              </Typography>
            </Grid>
            <Grid
              container
              item
              xs={2}
              md={12}
              alignItems="center"
              justifyContent="center"
            >
              <IconButton color="primary" size="small">
                <ArrowDownIcon className={classes.voteBtnIcon} />
              </IconButton>
            </Grid>
          </Grid>
          <Grid container item xs={12} md={11} className={classes.content}>
            <ButtonBase
              className={classes.buttonBase}
              onClick={navigateToIndividualPost}
            >
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="body2">
                    Posted by <b>{post.owner}</b> at{" "}
                    {new Date(post.createdAt).toLocaleString("en-IN")}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h2">{post.title}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1" component="p">
                    {post.content}
                  </Typography>
                </Grid>
                {postImage && (
                  <Grid item xs={12}>
                    <NextImage
                      src={postImage}
                      height={9 * 30}
                      width={16 * 30}
                      layout="responsive"
                      objectFit="contain"
                    />
                  </Grid>
                )}
              </Grid>
            </ButtonBase>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PostPreview;

interface UseStyleProps {
  matches: boolean;
}

const useStyles = (props: UseStyleProps) =>
  makeStyles((theme) =>
    createStyles({
      mainGrid: {
        flexGrow: 1,
        flexDirection: props.matches ? "column-reverse" : "row",
      },
      votes: {
        height: "100%",
        width: "100%",
        flexDirection: props.matches ? "row" : "column",
      },
      voteBtnIcon: {
        fontSize: 30,
      },
      content: {},
      buttonBase: {
        width: "100%",
        textAlign: "left",
      },
      picture: {
        width: "100%",
        height: "30rem",
        objectFit: "cover",
      },
    })
  );
