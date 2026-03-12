import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Calendar, MapPin, Users } from 'lucide-react';
import { apiClient } from '../api/axios';

// Описуємо тип нашої події, яку повертає бекенд
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number | null;
  organizer: { id: string; firstName: string; lastName: string; email: string };
  participants: { id: string }[];
}

export default function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Завантажуємо події при відкритті сторінки
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiClient.get('/events');
        setEvents(response.data);
      } catch (err) {
        setError('Не вдалося завантажити події. Спробуйте пізніше.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <div className="text-center mt-10 text-gray-500">Завантаження подій...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (events.length === 0) return <div className="text-center mt-10 text-gray-500">Поки що немає жодної події.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Найближчі події</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="p-5 flex-grow">
              <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                {event.title}
              </h2>
              
              <div className="space-y-2 mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>{format(new Date(event.date), 'd MMMM yyyy, HH:mm', { locale: uk })}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <span className="truncate">{event.location}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>
                    {event.participants.length} 
                    {event.capacity ? ` / ${event.capacity} місць` : ' учасників (безліміт)'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t bg-gray-50 mt-auto rounded-b-lg">
              <Link 
                to={`/events/${event.id}`} 
                className="block w-full text-center bg-white border border-indigo-600 text-indigo-600 py-2 rounded-md hover:bg-indigo-50 transition-colors"
              >
                Детальніше
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}