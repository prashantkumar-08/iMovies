import { useState } from 'react';

const AGES = ['U', 'U/A 7+', 'U/A 13+', 'U/A 16+', 'A'];

const toForm = (movie) => ({
  title: movie.title || '',
  genre: movie.genre?.join(', ') || '',
  language: movie.language || '',
  duration: movie.duration || 0,
  imdbRating: movie.imdbRating ?? movie.rating ?? '',
  description: movie.description || '',
  poster: movie.poster || '',
  cover: movie.cover || '',
  director: movie.director || '',
  cast: movie.cast?.join(', ') || '',
  crew: movie.crew?.map((person) => `${person.name} - ${person.role}`).join(', ') || '',
  ageRating: movie.ageRating || 'U/A 13+',
  releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().slice(0, 10) : '',
});

const toPayload = (form) => ({
  ...form,
  releaseDate: form.releaseDate || null,
  imdbRating: form.imdbRating === '' ? null : Number(form.imdbRating),
  genre: form.genre.split(',').map((item) => item.trim()).filter(Boolean),
  cast: form.cast.split(',').map((item) => item.trim()).filter(Boolean),
  crew: form.crew
    .split(',')
    .map((entry) => {
      const [name, role] = entry.split('-').map((part) => part.trim());
      return { name, role };
    })
    .filter((person) => person.name),
});

export function MovieListingForm({ movie, onSave, onCancel }) {
  const [form, setForm] = useState(() => toForm(movie));

  const update = (field, type = 'text') => (event) => {
    const value = type === 'number'
      ? event.target.value === '' ? '' : Number(event.target.value)
      : event.target.value;
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const renderInput = (label, field, type = 'text', required = false) => (
    <input
      type={type}
      placeholder={label}
      aria-label={label}
      required={required}
      min={field === 'imdbRating' ? 0 : undefined}
      max={field === 'imdbRating' ? 10 : undefined}
      step={field === 'imdbRating' ? 0.1 : undefined}
      value={form[field]}
      onChange={update(field, type)}
    />
  );

  const submit = (event) => {
    event.preventDefault();
    onSave(toPayload(form));
  };

  return (
    <form className="admin-movie-editor" onSubmit={submit}>
      <div className="admin-movie-editor__heading">
        <div>
          <small>Editing listing</small>
          <h2>{form.title || 'Movie details'}</h2>
        </div>
        <button type="button" className="ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <div className="row">
        {renderInput('Title', 'title', 'text', true)}
        {renderInput('Genres, comma separated', 'genre')}
        {renderInput('Language', 'language')}
        {renderInput('Duration (min)', 'duration', 'number')}
        {renderInput('IMDb rating (0-10)', 'imdbRating', 'number')}
      </div>

      <div className="row">
        <select aria-label="Age rating" value={form.ageRating} onChange={update('ageRating')}>
          {AGES.map((age) => <option key={age} value={age}>{age}</option>)}
        </select>
        {renderInput('Director', 'director')}
        {renderInput('Cast, comma separated', 'cast')}
        {renderInput('Crew: Name - Role, Name - Role', 'crew')}
        {renderInput('Release date', 'releaseDate', 'date')}
      </div>

      <div className="row">
        {renderInput('Poster image URL', 'poster')}
        {renderInput('Wide cover image URL', 'cover')}
        <textarea
          placeholder="Description"
          aria-label="Description"
          value={form.description}
          onChange={update('description')}
        />
      </div>

      <div className="admin-art-previews">
        <div>
          <span>Poster preview</span>
          {form.poster ? <img src={form.poster} alt={`${form.title} poster preview`} /> : <small>No poster URL</small>}
        </div>
        <div>
          <span>Cover preview</span>
          {form.cover ? <img src={form.cover} alt={`${form.title} cover preview`} /> : <small>No cover URL</small>}
        </div>
      </div>

      <button type="submit">Save listing</button>
    </form>
  );
}