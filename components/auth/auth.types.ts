export type AuthMode = "login" | "signup";

export interface AuthFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface PasswordCriterion {
  label: string;
  met: boolean;
}
