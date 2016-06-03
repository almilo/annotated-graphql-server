import fs from 'fs';
import path from 'path';

export function readSchemaFiles(schemaFolderPath) {
    return fs.readdirSync(schemaFolderPath).reduce(addSchemaFile, {});

    function addSchemaFile(schemas, schemaFileName) {
        const fileId = (schemaFileName.match(/(.*)\.graphql/) || [])[1];

        if (fileId) {
            schemas[fileId] = fs.readFileSync(path.join(schemaFolderPath, schemaFileName), 'utf8');
        }

        return schemas;
    }
}
