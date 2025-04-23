// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import Layout Components
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute'; // Keep this for route protection

// Import Page Components
import HomePage from './pages/HomePage';
import CreatePostPage from './pages/CreatePostPage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import PostDetailPage from './pages/PostDetailPage';
import EditPostPage from './pages/EditPostPage';
import InfoPage from './pages/InfoPage';


function App() {
  // If you plan to manage global state like posts list here later,
  // you would add useState for that here.
  // const [posts, setPosts] = useState([]);
  // const addPost = (newPost) => { /* logic to add post */ };

  return (
    <>
      {/* Header appears on all pages */}
      <Header />

      {/* Main content area where routes are rendered */}
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/post/:postId" element={<PostDetailPage />} />
          <Route path="/info" element={<InfoPage />} />


          {/* Protected Routes */}
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                {/* Pass necessary props if CreatePostPage needs them, e.g., addPost function */}
                <CreatePostPage /* addPost={addPost} */ />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post/:postId/edit"
            element={
              <ProtectedRoute> {/* Ensure only logged-in users can access edit page */}
                <EditPostPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all for Not Found pages (Optional) */}
          {/* <Route path="*" element={<div>Page Not Found</div>} /> */}
        </Routes>
      </main>

      {/* Optional Footer could go here */}
      {/* <footer> <p>&copy; 2025 The Quarantine Zone</p> </footer> */}
    </>
  );
}

export default App;