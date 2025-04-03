import React from 'react';

const MovieCard = ({ title, year, poster }) => {
    return (
        <div>
            <h2>{title} ({year})</h2>
            <img src={poster} alt={title} width="200" />
        </div>
    );
};

export default MovieCard;