import React, { useState } from 'react';
import MovieCard from './components/MovieCard';

const Home = () => {
    const [movie, setMovie] = useState({
        title: 'Inception',
        year: '2010',
        poster: 'https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg'
    });

    return (
        <div>
            <MovieCard title={movie.title} year={movie.year} poster={movie.poster} />
        </div>
    );
};

export default Home;