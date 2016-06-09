export default function (annotatedSchemasTextByApiId) {
    return function (req, res) {
        const apiId = req.params.api, annotatedSchema = annotatedSchemasTextByApiId[apiId];

        if (!annotatedSchema) {
            res.status(404).send(`No schema for api: '${apiId}' found.`)
        }

        res.set('Content-Type', 'text/plain');
        res.send(annotatedSchema);
    };
}
