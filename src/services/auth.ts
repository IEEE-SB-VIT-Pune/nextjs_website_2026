export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE";
  avatar?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  isEmailVerified?: boolean;
  hasSubmittedInterview?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: UserProfile;
  errors?: any;
}

export async function loginUser(body: any): Promise<AuthResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function registerUser(body: any): Promise<AuthResponse> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function logoutUser(): Promise<AuthResponse> {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
  });
  return res.json();
}

export async function getProfile(): Promise<AuthResponse> {
  const res = await fetch("/api/auth/me");
  return res.json();
}

export async function updateProfile(body: { name: string; avatar?: string }): Promise<AuthResponse> {
  const res = await fetch("/api/auth/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function changePassword(body: any): Promise<AuthResponse> {
  const res = await fetch("/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}
