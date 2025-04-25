import * as Yup from "yup";

const passwordRules = Yup.string()
  .min(6, "Password must be at least 6 characters")
  .required("Password is required");

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .matches(/^[\w\-.]+@([\w-]+\.)+[\w-]{2,}$/, "Invalid email format")
    .required("Email is required"),
  password: passwordRules,
});

const PasswordChangeSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: passwordRules,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Password confirmation is required"),
});

const ProfileSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscore"
    )
    .required("Username is required"),
});

export { LoginSchema, PasswordChangeSchema, ProfileSchema, passwordRules };
