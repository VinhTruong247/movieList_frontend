import React from 'react';
import './GenreList.scss';

const genres = [
    { id: "1", name: "Action" },
    { id: "2", name: "Adventure" },
    { id: "3", name: "Animation" },
    { id: "4", name: "Biography" },
    { id: "5", name: "Comedy" },
    { id: "6", name: "Crime" },
    { id: "7", name: "Documentary" },
    { id: "8", name: "Drama" },
    { id: "9", name: "Family" },
    { id: "10", name: "Fantasy" },
    { id: "11", name: "History" },
    { id: "12", name: "Horror" },
    { id: "13", name: "Indie" },
    { id: "14", name: "Medieval" },
    { id: "15", name: "Musical" },
    { id: "16", name: "Mystery" },
    { id: "17", name: "Romance" },
    { id: "18", name: "Sci-Fi" },
    { id: "19", name: "Sport" },
    { id: "20", name: "Thriller" },
    { id: "21", name: "War" },
    { id: "22", name: "Western" }
];

const GenreList = ({ selectedGenre, onGenreSelect, activeFilter, onFilterChange }) => {
    return (
        <div className="genre-list-container">
            <div className="filter-buttons">
                <button
                    className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => onFilterChange('all')}
                >
                    All Movies
                </button>
                <button
                    className={`filter-btn ${activeFilter === 'Movie' ? 'active' : ''}`}
                    onClick={() => onFilterChange('Movie')}
                >
                    Movies
                </button>
                <button
                    className={`filter-btn ${activeFilter === 'TV Series' ? 'active' : ''}`}
                    onClick={() => onFilterChange('TV Series')}
                >
                    TV Series
                </button>
                <button
                    className={`filter-btn ${activeFilter === 'top-rated' ? 'active' : ''}`}
                    onClick={() => onFilterChange('top-rated')}
                >
                    Top Rated
                </button>
                <button
                    className={`filter-btn ${activeFilter === 'latest' ? 'active' : ''}`}
                    onClick={() => onFilterChange('latest')}
                >
                    Latest
                </button>
            </div>

            <h3 className="genre-title">Genres</h3>
            <div className="genre-list">
                <button
                    className={`genre-item ${selectedGenre === 'all' ? 'active' : ''}`}
                    onClick={() => onGenreSelect('all')}
                >
                    All Genres
                </button>
                {genres.map((genre) => (
                    <button
                        key={genre.id}
                        className={`genre-item ${selectedGenre === genre.name ? 'active' : ''}`}
                        onClick={() => onGenreSelect(genre.name)}
                    >
                        {genre.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GenreList;