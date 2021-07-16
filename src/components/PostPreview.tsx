import {
  Card,
  CardContent,
  // CardMedia,
  createStyles,
  Grid,
  IconButton,
  makeStyles,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import ArrowUpIcon from "@material-ui/icons/ArrowUpwardRounded";
import ArrowDownIcon from "@material-ui/icons/ArrowDownwardRounded";
import { Post } from "../API";

interface Props {
  post: Post;
}

const PostPreview = ({ post }: Props) => {
  const matches = useMediaQuery("(max-width: 960px)");
  const classes = useStyles({ matches })();

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
          <Grid
            container
            item
            xs={12}
            md={11}
            spacing={2}
            className={classes.content}
          >
            <Grid item xs={12}>
              <Typography variant="body1">
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
            <Grid item xs={12}>
              {/* <CardMedia
                image="https://cdn.mos.cms.futurecdn.net/LBjdeVmH2C7KYspZBFH2hU.jpg"
                title="iMac 24 Purple"
                className={classes.picture}
              /> */}
            </Grid>
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
      picture: {
        width: "100%",
        height: "30rem",
        objectFit: "cover",
      },
    })
  );
