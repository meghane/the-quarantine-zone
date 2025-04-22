// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import CreatePostPage from './pages/CreatePostPage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import { Toaster } from 'react-hot-toast'; // 👈 1. Import Toaster

// Import other pages later

function App() {
  return (
    <>
      <Header />
      <Toaster // 👈 2. Render the Toaster component
        position="top-center" // You can customize position, duration etc.
        reverseOrder={false}
        toastOptions={{
            // Define default options
            duration: 8000, // Show for 3 seconds
            style: {
              background: '#363636', // Example dark background
              color: '#fff',
            },
             // Default options for specific types
            success: {
              duration: 3000,
              theme: {
                primary: 'green',
                secondary: 'black',
              },
            },
        }}
       />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
          {/* <Route path="/post/:postId" element={<PostDetailPage />} /> */}
          {/* <Route path="*" element={<div>Page Not Found</div>} /> */}
        </Routes>
      </main>
    </>
  );
}

export default App;