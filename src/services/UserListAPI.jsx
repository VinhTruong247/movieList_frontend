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

  if (userData.isDisabled) {
    localStorage.clear();
    sessionStorage.clear();
    await supabase.auth.signOut();
    throw new Error("Account has been disabled. Please contact support.");
  }

  return {
    session: data.session,
    userData,
  };
};

export const signUp = async ({ email, password, username, name }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
        username: username,
        role: "user",
        isDisabled: false,
      },
    },
  });

  if (error) throw error;

  if (data.user) {
    try {
      const { error: insertError } = await supabase.from("Users").upsert(
        {
          id: data.user.id,
          email: data.user.email,
          name: name,
          username: username,
          role: "user",
          isDisabled: false,
        },
        {
          onConflict: "id",
          ignoreDuplicates: false,
        }
      );

      if (insertError) {
        console.warn("Insert error (non-fatal):", insertError);
      }
    } catch (insertErr) {
      console.warn("Insert error caught (non-fatal):", insertErr);
    }
  }

  return data;
};

export const logoutUser = async (navigate) => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  localStorage.clear();
  sessionStorage.clear();

  if (navigate) {
    navigate("/login");
  }

  return { success: true };
};

export const getCurrentUser = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return null;

    const { data: userData, error: userError } = await supabase
      .from("Users")
      .select("*")
      .eq("email", session.user.email)
      .single();

    if (userError) {
      console.warn(userError);
      return null;
    }

    if (userData.isDisabled) {
      await supabase.auth.signOut();
      return null;
    }

    return { userData, session };
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

export const getUserById = async (userId) => {
  try {
    if (!userId) return null;

    const { data, error } = await supabase
      .from("user_public_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.warn("Error fetching user by ID:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
};

export const getOwnOrPublicProfile = async (userId) => {
  try {
    if (!userId) return null;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session && session.user && session.user.id === userId) {
      const { data: userData, error: userError } = await supabase
        .from("Users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError) {
        console.warn("Error fetching own user data:", userError);
        return null;
      }

      return {
        ...userData,
        isFullProfile: true,
      };
    }

    return await getUserById(userId);
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return null;
  }
};
