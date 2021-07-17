import {
  Card,
  CardContent,
  createStyles,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import React from "react";
import { Comment } from "../API";

interface Props {
  comment: Comment;
}

const CommentCard = ({ comment }: Props) => {
  const classes = useStyles();

  console.log(comment);
  return (
    <Card className={classes.card}>
      <CardContent>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="body2">
              <b>{comment.owner}</b> -{" "}
              {new Date(comment.createdAt).toLocaleString("en-IN")}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">{comment.content}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CommentCard;

const useStyles = makeStyles((theme) =>
  createStyles({
    card: {
      width: "100%",
    },
  })
);
