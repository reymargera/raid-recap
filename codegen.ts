import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: {
        "https://www.warcraftlogs.com/api/v2/client": {
            headers: {
                "Authorization": `Bearer ${process.env.TOKEN}`,
            }
        }
    },
    documents: ["src/**/*.ts"],
    generates: {
        "./src/__generated__/": {
            preset: "client",
            presetConfig: {
                gqlTagName: "gql",
            },
        },
    },
    ignoreNoDocuments: true,
};

export default config;
