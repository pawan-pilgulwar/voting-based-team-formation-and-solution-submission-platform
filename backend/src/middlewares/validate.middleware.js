import { ZodError } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    req.body = parsed.body ?? req.body;
    req.validatedQuery = parsed.query ?? req.query;
    req.params = parsed.params ?? req.params;
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }
    next(err);
  }
};
