import supabase from '../supabase-client';

export const addReview = async (movieId, userId, rating, comment) => {
    const { data, error } = await supabase
        .from('Reviews')
        .insert([{
            movie_id: movieId,
            user_id: userId,
            rating,
            comment,
            created_at: new Date()
        }])
        .select();

    if (error) throw error;
    return data;
};

export const getMovieReviews = async (movieId) => {
    const { data, error } = await supabase
        .from('Reviews')
        .select(`
        *,
        Users (id, username, avatar_url)
      `)
        .eq('movie_id', movieId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};