import { createStyles, makeStyles, Typography } from "@material-ui/core";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  file: string | undefined;
  setFile: Dispatch<SetStateAction<string | undefined>>;
}

export default function ImageDropzone({ file, setFile }: Props) {
  const classes = useStyles();

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    accept: "image/*",
    onDrop: (acceptedFiles: File[]) => {
      try {
        setFile(URL.createObjectURL(acceptedFiles[0]));
      } catch (error) {
        console.log(error);
      }
    },
  });

  const thumbs = file && (
    <div className={classes.thumb} key={file}>
      <div className={classes.thumbInner}>
        <img src={file} className={classes.img} />
      </div>
    </div>
  );

  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      URL.revokeObjectURL(file || "");
    },
    [file]
  );

  return (
    <section className={classes.container}>
      <div
        {...getRootProps({ className: "dropzone" })}
        className={classes.inputContainer}
      >
        <input {...getInputProps()} />
        <Typography variant="body2" component="p">
          {`Drag 'n' drop or select the image you want to upload for your post.`}
        </Typography>
      </div>
      <aside className={classes.thumbsContainer}>{thumbs}</aside>
    </section>
  );
}

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      background: theme.palette.background.default,
      padding: theme.spacing(2),
      borderRadius: theme.spacing(0.5),
    },
    thumb: {
      display: "inline-flex",
      borderRadius: 2,
      border: "1px solid #eaeaea",
      marginBottom: 8,
      marginRight: 8,
      width: 300,
      height: 300,
      padding: 4,
      boxSizing: "border-box",
      background: theme.palette.background.paper,
    },
    thumbInner: {
      display: "flex",
      minWidth: 0,
      overflow: "hidden",
    },
    thumbsContainer: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 16,
    },
    img: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
    },
    inputContainer: {
      border: `2px dashed ${theme.palette.text.secondary}`,
      padding: theme.spacing(4),
    },
  })
);
