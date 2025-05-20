import supabase from '../supabase-client';

export const getAllGenres = async () => {
  const { data, error } = await supabase
    .from('Genres')
    .select('*')
    .order('name');
    
  if (error) throw error;
  return data;
};