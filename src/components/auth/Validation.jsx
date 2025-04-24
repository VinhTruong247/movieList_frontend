import * as Yup from 'yup';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .matches(/^[\w\-.]+@([\w-]+\.)+[\w-]{2,}$/, 'Invalid email format')
    .required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export default LoginSchema;
