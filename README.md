# Movie Explorer

A responsive movie discovery application built with React, TypeScript, and the TMDb API. Browse trending movies, search for your favorite films, explore movie details, watch trailers, and save movies to your favorites.

## Features

- **Login:** Demo login with protected application routes.
- **Trending Movies:** Discover popular movies using the TMDb API.
- **Movie Search:** Search movies by title with infinite scrolling for additional results.
- **Movie Details:** View movie overviews, release dates, ratings, genres, and cast information.
- **Movie Trailers:** Watch available trailers on YouTube.
- **Favorites:** Add or remove favorite movies, with favorites saved in local storage.
- **Search Filters:** Filter search results by genre, release year, and minimum rating.
- **Light and Dark Mode:** Switch between themes, with the selected preference saved locally.
- **Search Persistence:** Remember the last searched movie using local storage.
- **Responsive Design:** Optimized for desktop and mobile screens.
- **Error Handling:** Display appropriate feedback for API errors, loading states, and empty search results.

## Tech Stack

- React
- TypeScript
- Vite
- Material UI (MUI)
- Axios
- React Router DOM
- React Context API
- TMDb API
- Browser Local Storage

## Getting Started

### Prerequisites

- Node.js
- npm
- A TMDb API key

### Installation

1. Clone the repository:

   ```bash
   git clone <your-repository-url>
   ```

2. Navigate to the project directory:

   ```bash
   cd <your-project-folder>
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the project root and add your TMDb API key:

   ```env
   VITE_TMDB_API_KEY=your_tmdb_api_key
   ```

   You can obtain an API key from [The Movie Database (TMDb)](https://www.themoviedb.org/).

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open the local URL displayed in your terminal, usually `http://localhost:5173`.

## Demo Login

Use the following credentials to access the application:

- **Username:** `demo`
- **Password:** `movie123`

**Note:** Authentication is implemented as a frontend demonstration. It does not use a backend authentication service and should not be considered secure for production use.

## Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Builds the application for production.

```bash
npm run preview
```

Previews the production build locally.

## Project Structure

```text
src/
├── api/
│   └── tmdb.ts
├── components/
│   ├── MovieCard.tsx
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
├── context/
│   ├── AuthContext.tsx
│   ├── FavoritesContext.tsx
│   └── ThemeContext.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── MovieDetailsPage.tsx
│   ├── FavoritesPage.tsx
│   └── LoginPage.tsx
├── types/
│   └── movie.ts
├── App.tsx
└── main.tsx
```

## API Integration

Movie data is retrieved from the TMDb API, including:

- Trending movies
- Movie search results
- Movie genres
- Movie details
- Cast and crew information
- Available videos and trailers

Axios is used to make API requests. Search results are loaded incrementally as users scroll through the list.

## State Management and Persistence

React Context API manages shared application state, including authentication, theme preferences, and favorite movies.

Browser local storage persists the user's favorites, theme preference, last search, and demo authentication state between page reloads.

## Deployment

The application can be deployed using platforms such as [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).

1. Push the project to your Git repository.
2. Import the repository into your hosting provider.
3. Add `VITE_TMDB_API_KEY` to the deployment environment variables.
4. Deploy the application.
5. Configure single-page application routing if necessary so routes such as `/login`, `/favorites`, and `/movies/:movieId` work when accessed directly.

## Acknowledgements

Movie information and images are provided by [The Movie Database (TMDb)](https://www.themoviedb.org/).

This project was developed as a movie discovery application to demonstrate API integration, React state management, routing, responsive UI development, and client-side persistence.