const Joi = require("joi");

// User validation schemas
const userSchemas = {
  // Registration schema
  register: {
    body: Joi.object({
      firstName: Joi.string().required().trim().min(2).max(50).messages({
        "string.empty": "First name is required",
        "string.min": "First name must be at least 2 characters",
        "string.max": "First name cannot exceed 50 characters",
      }),
      lastName: Joi.string().required().trim().min(2).max(50).messages({
        "string.empty": "Last name is required",
        "string.min": "Last name must be at least 2 characters",
        "string.max": "Last name cannot exceed 50 characters",
      }),
      email: Joi.string().required().email().messages({
        "string.empty": "Email is required",
        "string.email": "Please provide a valid email",
      }),
      password: Joi.string().required().min(6).messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters",
      }),
      phone: Joi.string().required().trim().messages({
        "string.empty": "Phone number is required",
      }),
      address: Joi.string().allow("", null),
      newsletter: Joi.boolean().default(false),
    }),
  },

  // Login schema
  login: {
    body: Joi.object({
      email: Joi.string().required().email().messages({
        "string.empty": "Email is required",
        "string.email": "Please provide a valid email",
      }),
      password: Joi.string().required().messages({
        "string.empty": "Password is required",
      }),
    }),
  },

  // Update profile schema
  updateProfile: {
    body: Joi.object({
      firstName: Joi.string().trim().min(2).max(50),
      lastName: Joi.string().trim().min(2).max(50),
      email: Joi.string().email(),
      phone: Joi.string().trim(),
      address: Joi.string().allow("", null),
      newsletter: Joi.boolean(),
    }),
  },

  // Change password schema
  changePassword: {
    body: Joi.object({
      currentPassword: Joi.string().required().messages({
        "string.empty": "Current password is required",
      }),
      newPassword: Joi.string().required().min(6).messages({
        "string.empty": "New password is required",
        "string.min": "New password must be at least 6 characters",
      }),
    }),
  },
};

// Product validation schemas
const productSchemas = {
  // Create product schema
  createProduct: {
    body: Joi.object({
      name: Joi.string().required().trim().messages({
        "string.empty": "Product name is required",
      }),
      category: Joi.string().required().messages({
        "string.empty": "Category is required",
      }),
      price: Joi.number().required().min(0).messages({
        "number.base": "Price must be a number",
        "number.min": "Price cannot be negative",
      }),
      description: Joi.string().required().messages({
        "string.empty": "Description is required",
      }),
      image: Joi.string().required().messages({
        "string.empty": "Image URL is required",
      }),
      allergens: Joi.array().items(Joi.string()),
      isAvailable: Joi.boolean().default(true),
      isFeatured: Joi.boolean().default(false),
      customizable: Joi.boolean().default(false),
      options: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          choices: Joi.array().items(Joi.string()),
        })
      ),
      minServings: Joi.number().integer().min(1),
      maxServings: Joi.number().integer().min(1),
      minQuantity: Joi.number().integer().min(1).default(1),
      maxQuantity: Joi.number().integer().min(1),
    }),
  },

  // Update product schema (same as create but all fields optional)
  updateProduct: {
    body: Joi.object({
      name: Joi.string().trim(),
      category: Joi.string(),
      price: Joi.number().min(0),
      description: Joi.string(),
      image: Joi.string(),
      allergens: Joi.array().items(Joi.string()),
      isAvailable: Joi.boolean(),
      isFeatured: Joi.boolean(),
      customizable: Joi.boolean(),
      options: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          choices: Joi.array().items(Joi.string()),
        })
      ),
      minServings: Joi.number().integer().min(1),
      maxServings: Joi.number().integer().min(1),
      minQuantity: Joi.number().integer().min(1),
      maxQuantity: Joi.number().integer().min(1),
    }),
  },
};

// Order validation schemas
const orderSchemas = {
  // Create order schema
  createOrder: {
    body: Joi.object({
      customer: Joi.object({
        userId: Joi.string().allow(null),
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        phone: Joi.string().required(),
        address: Joi.string().allow("", null),
      }).required(),
      items: Joi.array()
        .items(
          Joi.object({
            productId: Joi.string().required(),
            name: Joi.string().required(),
            quantity: Joi.number().integer().min(1).required(),
            price: Joi.number().required().min(0),
            customizations: Joi.object().allow(null),
          })
        )
        .min(1)
        .required(),
      total: Joi.number().required().min(0),
      paymentMethod: Joi.string(),
      deliveryMethod: Joi.string().valid("pickup", "delivery").required(),
      deliveryDate: Joi.date().iso().required(),
      deliveryAddress: Joi.string().when("deliveryMethod", {
        is: "delivery",
        then: Joi.string().required(),
        otherwise: Joi.string().allow("", null),
      }),
      deliveryInstructions: Joi.string().allow("", null),
      notes: Joi.string().allow("", null),
    }),
  },

  // Update order status schema
  updateOrderStatus: {
    body: Joi.object({
      status: Joi.string()
        .valid("Pending", "Processing", "Shipped", "Delivered", "Cancelled")
        .required()
        .messages({
          "string.empty": "Status is required",
          "any.only":
            "Status must be one of: Pending, Processing, Shipped, Delivered, Cancelled",
        }),
    }),
  },
};

// FAQ validation schemas
const faqSchemas = {
  // Create FAQ schema
  createFAQ: {
    body: Joi.object({
      question: Joi.string().required().trim().messages({
        "string.empty": "Question is required",
      }),
      answer: Joi.string().required().trim().messages({
        "string.empty": "Answer is required",
      }),
      category: Joi.string().allow("", null),
      order: Joi.number().integer().min(0).default(0),
    }),
  },
};

// Testimonial validation schemas
const testimonialSchemas = {
  // Create testimonial schema
  createTestimonial: {
    body: Joi.object({
      name: Joi.string().required().trim().messages({
        "string.empty": "Name is required",
      }),
      location: Joi.string().allow("", null),
      rating: Joi.number().integer().min(1).max(5),
      text: Joi.string().required().trim().messages({
        "string.empty": "Testimonial text is required",
      }),
      image: Joi.string().allow("", null),
      approved: Joi.boolean().default(false),
    }),
  },
};

// Payment validation schemas
const paymentSchemas = {
  // Initiate M-Pesa payment schema
  initiateMpesa: {
    body: Joi.object({
      phone: Joi.string().required().messages({
        "string.empty": "Phone number is required",
      }),
      amount: Joi.number().required().min(1).messages({
        "number.base": "Amount must be a number",
        "number.min": "Amount must be at least 1",
      }),
      orderId: Joi.string().required().messages({
        "string.empty": "Order ID is required",
      }),
    }),
  },
};

module.exports = {
  userSchemas,
  productSchemas,
  orderSchemas,
  faqSchemas,
  testimonialSchemas,
  paymentSchemas,
};
