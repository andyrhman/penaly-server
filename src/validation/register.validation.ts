import Joi from "joi";

export const RegisterValidation = Joi.object({
    fullname: Joi.string().required().messages({
        'string.base': 'Full name must be a string'
    }),
    username: Joi.string().alphanum().min(3).max(30).required().messages({
        'any.required': 'Username is required',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
        'any.required': 'Password is required',
        'string.min': 'Password must be at least 6 characters long',
    }),
    password_confirm: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.required': 'Password Confirm is required',
        'any.only': 'Password Confirm must be the same as password',
    }),
})