import * as Yup from "yup";

const usernameRules = Yup.string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must not exceed 30 characters")
  .matches(
    /^[a-zA-Z0-9_\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ]+$/,
    "Username can only contain letters, numbers, spaces, underscore"
  )
  .required("Username is required");

const emailRules = Yup.string()
  .matches(/^[\w\-.]+@([\w-]+\.)+[\w-]{2,}$/, "Invalid email format")
  .required("Email is required");

const passwordRules = Yup.string()
  .min(6, "Password must be at least 6 characters")
  .required("Password is required");

const LoginSchema = Yup.object().shape({
  email: emailRules,
  password: passwordRules,
});

const RegisterSchema = Yup.object().shape({
  username: usernameRules,
  email: emailRules,
  password: passwordRules,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Password confirmation is required"),
});

const PasswordChangeSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: passwordRules.notOneOf(
    [Yup.ref("currentPassword")],
    "New password must be different from current password"
  ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Password confirmation is required"),
});

const ProfileSchema = Yup.object().shape({
  username: usernameRules,
});

export { LoginSchema, RegisterSchema, PasswordChangeSchema, ProfileSchema };
