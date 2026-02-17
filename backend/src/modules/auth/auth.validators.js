import { body, validationResult } from "express-validator";

const rules = {
  register: [
    body("nombre").isString().isLength({ min: 2 }),
    body("apellido").isString().isLength({ min: 2 }),
    body("email").isEmail(),
    body("username").isString().isLength({ min: 3 }),
    body("password").isString().isLength({ min: 8 }),
    body("fecha_nacimiento").isISO8601(), // YYYY-MM-DD
    body("telefono").optional().isString(),
    body("id_rol").isInt({ min: 1, max: 3 }),
    body("cuit").optional().isString().isLength({ min: 8, max: 20 }),
    body("razon_social").optional().isString().isLength({ min: 2, max: 150 }),
    body("sitio_web").optional().isString().isLength({ max: 255 }),
  ],
  login: [
    body("identifier").isString(), // email o username
    body("password").isString(),
  ],
};

export function validate(name) {
  return [
    ...(rules[name] || []),
    (req, _res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const err = new Error("Validación fallida");
        err.statusCode = 400;
        err.details = errors.array();
        return next(err);
      }
      next();
    },
  ];
}
