import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  createStyles,
  Grid,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import ImageDropzone from "../components/ImageDropzone";
import { Storage, API } from "aws-amplify";
import { GRAPHQL_AUTH_MODE } from "@aws-amplify/api-graphql";
import { v4 as uuidv4 } from "uuid";
import { createPost } from "../graphql/mutations";
import { CustomGraphQLResponse } from "../types/CustomGraphQLResponse";
import { CreatePostInput, CreatePostMutation } from "../API";
import { useRouter } from "next/router";

interface Props {}

interface CreatePostData {
  title: string;
  content: string;
}

const Create = (props: Props) => {
  const classes = useStyles();
  const [file, setFile] = useState<File | undefined | null>(null);
  const router = useRouter();

  const {
    formState: {
      errors: formErrors,
      isValid: isFormValid,
      isSubmitting: isFormSubmitting,
    },
    handleSubmit,
    register,
  } = useForm<CreatePostData>({ mode: "all" });

  const onSubmit: SubmitHandler<CreatePostData> = async (data) => {
    console.log({
      ...data,
      file,
    });

    if (file) {
      // User uploaded file
      // Send request to upload to the S3 bucket
      try {
        const imagePath = uuidv4();
        const uploadResult = await Storage.put(imagePath, file, {
          contentType: file.type, // contentType is optional
        });
        console.log("File uploaded! ", { uploadResult });

        // Once the file is uploaded...
        const createPostInput: CreatePostInput = {
          title: data.title,
          content: data.content,
          image: imagePath,
          upvotes: 0,
          downvotes: 0,
        };
        const createdPost = (await API.graphql({
          query: createPost,
          variables: { input: createPostInput },
          authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
        })) as CustomGraphQLResponse<CreatePostMutation>;

        console.log("New Post Created! ", { createdPost });

        router.push(`/post/${createdPost.data.createPost?.id}`);
      } catch (error) {
        console.log("Error uploading file: ", error);
      }
    }
  };

  return (
    <Container maxWidth="md" className={classes.root}>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h3">Create Post</Typography>
            </Grid>
            <Grid item xs={12}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="title"
                      label="Title"
                      variant="outlined"
                      {...register("title", {
                        required: {
                          value: true,
                          message: "Please enter a Title",
                        },
                        maxLength: {
                          value: 120,
                          message: "Title should be between 1-120 characters",
                        },
                      })}
                      error={!!formErrors.title}
                      helperText={formErrors.title?.message}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="content"
                      label="Content"
                      variant="outlined"
                      multiline
                      rows={6}
                      {...register("content", {
                        required: {
                          value: true,
                          message: "Please enter some Content",
                        },
                        maxLength: {
                          value: 1800,
                          message:
                            "Content should be between 1-1800 characters",
                        },
                      })}
                      error={!!formErrors.content}
                      helperText={
                        formErrors.content?.message || "Max 1800 characters"
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ImageDropzone file={file} setFile={setFile} />
                  </Grid>
                  <Grid item xs={12} container justifyContent="flex-end">
                    {!isFormSubmitting && (
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={!isFormValid}
                        type="submit"
                      >
                        Post
                      </Button>
                    )}
                    {isFormSubmitting && <CircularProgress />}
                  </Grid>
                </Grid>
              </form>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Create;

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      paddingTop: theme.spacing(4),
    },
  })
);
