// import axios from "axios";
import supabase from '../supabase-client';

// const API_URL = "https://65f43205f54db27bc020c3ff.mockapi.io/api/v1/userData";

// export const fetchUsers = async () => {
//   try {
//     const response = await axios.get(API_URL);
//     return response.data;
//   } catch (error) {
//     // console.error("Error fetching users:", error);
//     throw error;
//   }
// };

// export const fetchUserById = async (id) => {
//   try {
//     const response = await axios.get(`${API_URL}/${id}`);
//     return response.data;
//   } catch (error) {
//     // console.error(`Error fetching user with id ${id}:`, error);
//     throw error;
//   }
// };

// export const createUser = async (userData) => {
//   try {
//     const response = await axios.post(API_URL, userData);
//     return response.data;
//   } catch (error) {
//     // console.error("Error creating user:", error);
//     throw error;
//   }
// };

// export const updateUser = async (id, userData) => {
//   try {
//     const response = await axios.put(`${API_URL}/${id}`, userData);
//     return response.data;
//   } catch (error) {
//     // console.error(`Error updating user with id ${id}:`, error);
//     throw error;
//   }
// };

// export const verifyPassword = async (userId, password) => {
//   try {
//     const response = await axios.get(API_URL);
//     const users = response.data;

//     const user = users.find((u) => u.id === userId);

//     if (!user) {
//       return false;
//     }

//     return user.password === password;
//   } catch (error) {
//     // console.error("Error verifying password:", error);
//     return false;
//   }
// };

// export const deleteUser = async (id) => {
//   try {
//     const response = await axios.delete(`${API_URL}/${id}`);
//     return response.data;
//   } catch (error) {
//     // console.error(`Error deleting user with id ${id}:`, error);
//     throw error;
//   }
// };

// export const loginUser = async (email, password) => {
//   try {
//     const response = await axios.get(API_URL);
//     const users = response.data;

//     const user = users.find(
//       (u) => u.email === email && u.password === password
//     );

//     if (user) {
//       const { password: _, ...userWithoutPassword } = user;
//       localStorage.setItem("user", JSON.stringify(userWithoutPassword));

//       window.dispatchEvent(new Event("auth-change"));

//       return {
//         success: true,
//         user: userWithoutPassword,
//       };
//     } else {
//       throw new Error("Invalid email or password");
//     }
//   } catch (error) {
//     // console.error('Login error:', error);
//     throw error;
//   }
// };

// export const registerUser = async (username, email, password) => {
//   try {
//     const response = await axios.get(`${API_URL}`);
//     const users = response.data;
//     const emailExists = users.some((user) => user.email === email);
//     if (emailExists) {
//       throw { errors: ["Email already exists"] };
//     }

//     const usernameExists = users.some((user) => user.username === username);
//     if (usernameExists) {
//       throw { errors: ["Username already exists"] };
//     }

//     const newUser = {
//       id: Date.now().toString(),
//       username,
//       email,
//       password,
//       role: "user",
//       isDisable: false,
//       favorites: [],
//     };

//     await axios.post(API_URL, newUser);

//     return { success: true };
//   } catch (error) {
//     // console.error('Register error:', error);
//     throw error;
//   }
// };

// export const logoutUser = () => {
//   try {
//     localStorage.removeItem("user");
//     window.dispatchEvent(new Event("auth-change"));
//     return { success: true };
//   } catch (error) {
//     // console.error('Logout error:', error);
//     throw error;
//   }
// };

// export const getCurrentUser = () => {
//   try {
//     const user = localStorage.getItem("user");
//     return user ? JSON.parse(user) : null;
//   } catch (error) {
//     // console.error('Error getting current user:', error);
//     return null;
//   }
// };

// export const updateUserFavorites = async (userId, userData) => {
//   try {
//     const response = await axios.put(`${API_URL}/${userId}`, userData);
//     return response.data;
//   } catch (error) {
//     // console.error('Error updating favorites:', error);
//     throw error;
//   }
// };

export const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from('Users')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('Users')
    .update(updates)
    .eq('id', userId);
    
  if (error) throw error;
  return data;
};

export const signUp = async ({ email, password, username, name }) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  if (authError) throw authError;
  const { data: userData, error: userError } = await supabase
    .from('Users')
    .insert([{
      id: authData.user.id,
      email,
      username,
      name,
      role: 'user',
      isDisabled: false,
    }])
    .select()
    .single();
  if (userError) throw userError;
  return { authData, userData };
};

export const loginUser = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;

  const { data: userData, error: userError } = await supabase
    .from('Users')
    .select('*')
    .eq('id', data.user.id)
    .single();
  
  if (userError) throw userError;
  
  return { ...data, userData };
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) throw error;
  if (!session) return null;

  const { data: userData, error: userError } = await supabase
    .from('Users')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  if (userError) throw userError;
  
  return { user: session.user, userData };
};

export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) throw error;
  return true;
};

export const updatePassword = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) throw error;
  return true;
};

// export const loginWithProvider = async (provider) => {
//   const { data, error } = await supabase.auth.signInWithOAuth({
//     provider,
//     options: {
//       redirectTo: `${window.location.origin}/auth/callback`,
//     }
//   });
  
//   if (error) throw error;
//   return data;
// };

// export const isEmailVerified = async () => {
//   const { data: { user }, error } = await supabase.auth.getUser(); 
//   if (error) throw error;
//   if (!user) return false; 
//   return user.email_confirmed_at !== null;
// };
