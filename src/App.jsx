import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import CreatePostPage from './pages/CreatePostPage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import PostDetailPage from './pages/PostDetailPage';
import EditPostPage from './pages/EditPostPage';
import InfoPage from './pages/InfoPage';


function App() {


  return (
    <>
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/post/:postId" element={<PostDetailPage />} />
          <Route path="/info" element={<InfoPage />} />


          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreatePostPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post/:postId/edit"
            element={
              <ProtectedRoute>
                <EditPostPage />
              </ProtectedRoute>
            }
          />

        </Routes>
      </main>

    </>
  );
}

export default App;