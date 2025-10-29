import Joi from 'joi';

// Helper para validar datos
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    next();
  };
};

// Esquemas de validación
export const validateRegister = validate(
  Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
    username: Joi.string().min(2).max(30).optional().messages({
      'string.min': 'Username must be at least 2 characters long',
      'string.max': 'Username cannot exceed 30 characters'
    }),
    birthDate: Joi.date().optional(),
    acceptLegal: Joi.boolean().valid(true).required().messages({
      'any.required': 'Debes aceptar los términos legales para registrarte.',
      'any.only': 'Debes aceptar los términos legales para registrarte.'
    }),
    acceptNewsletter: Joi.boolean().optional()
  })
);

export const validateLogin = validate(
  Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  })
);

export const validateReading = validate(
  Joi.object({
    type: Joi.string().valid('TAROT', 'RUNES').required().messages({
      'any.only': 'Reading type must be either TAROT or RUNES',
      'any.required': 'Reading type is required'
    }),
    spreadType: Joi.string().required().messages({
      'any.required': 'Spread type is required'
    }),
    deckType: Joi.string().optional(),
    question: Joi.string().min(10).max(500).required().messages({
      'string.min': 'Question must be at least 10 characters long',
      'string.max': 'Question cannot exceed 500 characters',
      'any.required': 'Question is required'
    }),
    anonBirthDate: Joi.date().optional(),
    anonGender: Joi.string().valid('MASCULINE', 'FEMININE', 'OTHER').optional()
  })
);

export const validateUpdateProfile = validate(
  Joi.object({
    username: Joi.string().min(2).max(30).optional(),
    birthDate: Joi.date().optional(),
    bio: Joi.string().max(500).allow('').optional(),
    firstName: Joi.string().max(50).allow('').optional(),
    lastName: Joi.string().max(50).allow('').optional(),
    location: Joi.string().max(100).allow('').optional(),
    phone: Joi.string().max(30).allow('').optional(),
    website: Joi.string().max(100).allow('').optional(),
    interests: Joi.array().items(Joi.string().max(50)).optional(),
    email: Joi.string().email().optional(),
    currentPassword: Joi.string().min(6).optional(),
    newPassword: Joi.string().min(6).optional()
  }).with('newPassword', 'currentPassword')
);

export const validateBlogPost = validate(
  Joi.object({
    title: Joi.string().min(5).max(200).required(),
    content: Joi.string().min(50).required(),
    excerpt: Joi.string().max(300).optional(),
    published: Joi.boolean().optional()
  })
);

export const validateOrder = validate(
  Joi.object({
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required()
      })
    ).min(1).required(),
    shippingName: Joi.string().min(2).required(),
    shippingEmail: Joi.string().email().required(),
    shippingAddress: Joi.string().min(10).required(),
    shippingCity: Joi.string().min(2).required(),
    shippingZip: Joi.string().min(3).required(),
    shippingCountry: Joi.string().min(2).required()
  })
);
