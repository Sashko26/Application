import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import { logout } from '../store/authSlice';

export default function Layout() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); // Очищаємо Redux та localStorage
    navigate('/login'); // Перекидаємо на сторінку входу
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          {/* Логотип */}
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            EventHub
          </Link>

          {/* Навігація */}
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Всі події
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/my-events" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Мої події
                </Link>
                <Link to="/create-event" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                  Створити подію
                </Link>
                <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition-colors">
                  Вийти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Увійти
                </Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                  Реєстрація
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Основний контент сторінок буде рендеритись тут */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}