const validate = (schema) => {
    return async (req, res, next) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            // Mutate req fields with parsed/coerced values
            if (parsed.body !== undefined) req.body = parsed.body;
            if (parsed.query !== undefined) req.query = parsed.query;
            if (parsed.params !== undefined) req.params = parsed.params;

            next();
        } catch (error) {
            if (error.name === 'ZodError') {
                const issues = error.issues || [];
                return res.status(400).json({
                    status: 'fail',
                    message: 'Validation failed',
                    errors: issues.map((err) => ({
                        path: err.path.filter((p) => p !== 'body' && p !== 'query' && p !== 'params').join('.'),
                        message: err.message,
                    })),
                });
            }
            next(error);
        }
    };
};

module.exports = validate;
