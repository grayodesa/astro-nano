import { defineConfig } from "tinacms";
import { tinaEnv } from "./env";
// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

  console.log('Client ID:', tinaEnv.clientId);
  console.log('Token:', tinaEnv.token);

export default defineConfig({
  clientId: tinaEnv.clientId,    // Use from tinaEnv
  token: tinaEnv.token,     
  branch,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
  schema: {
    collections: [
      {
        name: "post",
        label: "Posts",
        path: "src/content/posts",
        format: "md",
        fields: [
          {
            type: "datetime",
            name: "date",
            label: "Date Posted",
            required: true,
          },
          {
            type: "string",
            name: "url",
            label: "URL",
            required: true,
          },
          {
            type: "string",
            name: "source",
            label: "Source",
          },
          {
            type: "string",
            name: "images",
            label: "Images",
          },
          {
            type: "string",
            name: "forwarded_from",
            label: "Forwarded From",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ],
  },
});
