import supabase from "../supabase-client";

export const loginUser = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const { data: userData, error: userError } = await supabase
    .from("Users")
    .select("*")
    .eq("email", email)
    .single();

  if (userError) throw userError;

  return {
    session: data.session,
    userData,
  };
};

export const signUp = async ({ email, password, username, name }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  const { error: insertError } = await supabase.from("Users").insert([
    {
      email,
      username,
      name: name || username,
      role: "user",
      isDisabled: false,
    },
  ]);

  if (insertError) throw insertError;

  return data;
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return { success: true };
};

export const getCurrentUser = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // If no session exists, just return null without throwing error
    if (!session) {
      return null;
    }

    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return null;
    }

    const { data: userData, error: userError } = await supabase
      .from("Users")
      .select("*")
      .eq("email", authData.user.email)
      .single();

    if (userError) {
      console.warn("User found in auth but not in database:", userError);
      return null;
    }

    return { userData };
  } catch (error) {
    console.error("Session error:", error);
    return null;
  }
};

export const updateUserProfile = async (userId, updates) => {
  const { error } = await supabase
    .from("Users")
    .update(updates)
    .eq("id", userId);

  if (error) throw error;
  return { success: true };
};
