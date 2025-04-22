import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
// Import other pages later (e.g., CreatePostPage, PostDetailPage)

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Define other routes here later */}
          {/* <Route path="/create" element={<CreatePostPage />} /> */}
          {/* <Route path="/post/:postId" element={<PostDetailPage />} /> */}
          {/* <Route path="*" element={<div>Page Not Found</div>} /> */}
        </Routes>
      </main>
      {/* Optional Footer can go here */}
    </>
  );
}

export default App;