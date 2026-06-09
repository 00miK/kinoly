import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      {/* Logo cliquable renvoyant vers l'accueil */}
      <Link to="/" className="navbar-logo">Kinoly</Link>

      <div className="navbar-links">
        <NavLink to="/movies">Films</NavLink>

        {user ? (
          /* Liens réservés aux utilisateurs connectés */
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>

            {/* Lien Admin visible uniquement pour le rôle 'admin' */}
            {user.role === 'admin' && (
              <NavLink to="/admin">Admin</NavLink>
            )}

            <button onClick={logout} className="btn-logout">
              Déconnexion
            </button>
          </>
        ) : (
          /* Liens pour les visiteurs non connectés */
          <>
            <NavLink to="/login">Connexion</NavLink>
            <NavLink to="/register">Inscription</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
