import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Calendar, MapPin, Users, User, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import type { RootState } from '../store/store';
import { apiClient } from '../api/axios';

interface EventDetailsData {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number | null;
  organizer: { id: string; firstName: string; lastName: string; email: string };
  participants: { id: string; firstName: string; lastName: string }[];
}

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const fetchEvent = async () => {
    try {
      const response = await apiClient.get(`/events/${id}`);
      setEvent(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не вдалося завантажити подію');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleJoin = async () => {
    try {
      await apiClient.post(`/events/${id}/join`);
      fetchEvent(); 
    } catch (err: any) {
      alert(err.response?.data?.message || 'Помилка при приєднанні');
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Ви впевнені, що хочете скасувати участь?')) return;
    try {
      await apiClient.post(`/events/${id}/leave`);
      fetchEvent(); 
    } catch (err: any) {
      alert(err.response?.data?.message || 'Помилка при відписці');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Ви впевнені, що хочете видалити цю подію назавжди?')) return;
    try {
      await apiClient.delete(`/events/${id}`);
      navigate('/'); 
    } catch (err: any) {
      alert(err.response?.data?.message || 'Помилка при видаленні');
    }
  };

  if (loading) return <div className="text-center mt-10">Завантаження...</div>;
  if (error || !event) return <div className="text-center mt-10 text-red-500">{error || 'Подію не знайдено'}</div>;

  const isOrganizer = currentUser?.id === event.organizer.id;
  const isParticipant = event.participants.some(p => p.id === currentUser?.id);
  const isFull = event.capacity !== null && event.participants.length >= event.capacity;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Назад до всіх подій
      </Link>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            
            {/* Кнопки Редагувати / Видалити для організатора */}
            {isOrganizer && (
              <div className="flex gap-2">
                <Link 
                  to={`/events/${event.id}/edit`} 
                  className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
                >
                  <Edit className="w-4 h-4" /> Редагувати
                </Link>
                <button 
                  onClick={handleDelete} 
                  className="flex items-center gap-1 text-sm bg-red-50 text-red-700 px-3 py-1.5 rounded-md hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Видалити
                </button>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-6 mb-8 text-gray-600 border-b pb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <span>{format(new Date(event.date), 'd MMMM yyyy, HH:mm', { locale: uk })}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-500" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" />
              <span>Організатор: <span className="font-medium text-gray-900">{event.organizer.firstName} {event.organizer.lastName}</span></span>
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <h3 className="text-xl font-semibold mb-3">Про подію</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{event.description || 'Опис відсутній.'}</p>
          </div>

          <div className="border-t pt-6 flex justify-between items-center bg-gray-50 -mx-8 -mb-8 p-8">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <Users className="w-5 h-5 text-indigo-500" />
              <span>Учасники: {event.participants.length} {event.capacity ? `з ${event.capacity}` : ''}</span>
            </div>
            
            <div>
              {!isAuthenticated ? (
                <Link to="/login" className="bg-indigo-600 text-white px-6 py-2.5 rounded-md hover:bg-indigo-700 transition-colors shadow-sm">
                  Увійдіть, щоб приєднатися
                </Link>
              ) : isOrganizer ? (
                <span className="inline-block bg-indigo-100 text-indigo-800 px-4 py-2 rounded-md font-medium border border-indigo-200">
                  Ви організатор
                </span>
              ) : isParticipant ? (
                <button onClick={handleLeave} className="bg-white text-red-600 border border-red-200 px-6 py-2.5 rounded-md hover:bg-red-50 transition-colors shadow-sm font-medium">
                  Покинути подію
                </button>
              ) : isFull ? (
                <span className="inline-block bg-gray-100 text-gray-500 px-6 py-2.5 rounded-md font-medium border">
                  Немає вільних місць
                </span>
              ) : (
                <button onClick={handleJoin} className="bg-indigo-600 text-white px-8 py-2.5 rounded-md hover:bg-indigo-700 transition-colors shadow-sm font-medium">
                  Приєднатися
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* НОВИЙ БЛОК: Список імен учасників (вимога з ТЗ) */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden p-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" /> 
          Список учасників
        </h3>
        {event.participants.length === 0 ? (
          <p className="text-gray-500 italic">Поки що немає учасників. Будьте першим!</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {event.participants.map((p) => (
              <li key={p.id} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                  {p.firstName[0]}{p.lastName[0]}
                </div>
                <span className="text-sm font-medium text-gray-700">{p.firstName} {p.lastName}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}