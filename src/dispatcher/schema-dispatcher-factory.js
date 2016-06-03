export default function (annotatedSchemas) {
    return function (req, res) {
        const api = req.params.api, annotatedSchema = annotatedSchemas[api];

        if (!annotatedSchema) {
            res.status(404).send(`No schema for api: '${api}' found.`)
        }

        res.set('Content-Type', 'text/plain');
        res.send(annotatedSchema);
    };
}
