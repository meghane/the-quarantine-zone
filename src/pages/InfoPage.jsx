// src/pages/InfoPage.jsx
import React from 'react';
import './InfoPage.css'; // Optional: Create this file for styling

function InfoPage() {
  // Get current year for copyright or info
  const currentYear = new Date().getFullYear();

  return (
    <div className="container info-page"> {/* Use container for consistent width */}
      <h1>About The Quarantine Zone</h1>
      <p className="tagline">A place for fans of The Last of Us - games and show.</p>

      <section className="info-section">
        <h2>Purpose of This App</h2>
        <p>
          Welcome fellow survivor! This forum, "The Quarantine Zone," was created
          as a project to build a community space dedicated to discussing
          everything related to Naughty Dog's incredible series, The Last of Us.
          Whether you're passionate about the intricate story of the games (Part I, Left Behind, Part II),
          hooked on the HBO adaptation, or just want to share theories, fan art, or gameplay moments,
          this is the place for you. We aim to provide a platform for respectful discussion,
          analysis, and sharing among fans. Remember to look for the light!
        </p>
        {/* Add more paragraphs or details about your inspiration or goals */}
      </section>

      <section className="info-section">
        <h2>Terms of Service (Example)</h2>
        <p>
          By using The Quarantine Zone, you agree to be respectful towards other users.
          Hate speech, harassment, and spam will not be tolerated. Please be mindful of spoilers
          for both the games and the show – consider using spoiler tags or warnings where appropriate
          (Note: Spoiler tag functionality is not implemented in this basic version).
          All content shared should comply with copyright laws. The administrators reserve the right
          to remove content or suspend accounts that violate these terms. Use of this site is
          at your own risk. This is a portfolio project and not a commercial service.
        </p>
        {/* Expand this significantly for a real application */}
      </section>

      <section className="info-section">
          <h2>Privacy Policy (Example)</h2>
          <p>
              We collect your email address and chosen username during signup solely for
              authentication and display purposes within the app. Passwords are securely
              hashed via Supabase Auth. We do not share your personal information with third parties.
              Posts and comments you create are linked to your user ID. Please be mindful of the
              information you share publicly in posts and comments. Data is stored securely using Supabase.
          </p>
          {/* Expand this significantly for a real application */}
      </section>

      <footer className="info-footer">
        <p>The Quarantine Zone - Fan Project {currentYear}</p>
        <p>The Last of Us is a trademark of Sony Interactive Entertainment LLC.</p>
      </footer>
    </div>
  );
}

export default InfoPage;