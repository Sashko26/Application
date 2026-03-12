import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { uk } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { apiClient } from '../api/axios';
import type { RootState } from '../store/store';

// Налаштовуємо локалізацію для календаря (щоб тиждень починався з понеділка і все було українською)
const locales = {
  'uk': uk,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Тип для події, який розуміє календар
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  isOrganizer: boolean;
}

export default function MyEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const response = await apiClient.get('/users/me/events');
        let allEvents = [];
        
        // Збираємо всі події (і організовані, і ті, де ми учасники) в один масив
        if (Array.isArray(response.data)) {
          allEvents = response.data;
        } else {
          allEvents = [...(response.data.organized || []), ...(response.data.participating || [])];
        }

        // Перетворюємо дані з бекенду у формат, який потрібен календарю
        const formattedEvents = allEvents.map((event: any) => {
          const startDate = new Date(event.date);
          // Оскільки в нас немає дати завершення, умовно додаємо 2 години для відображення в календарі
          const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); 
          
          return {
            id: event.id,
            title: event.title,
            start: startDate,
            end: endDate,
            isOrganizer: event.organizer?.id === currentUser?.id
          };
        });

        setEvents(formattedEvents);
      } catch (error) {
        console.error('Помилка завантаження подій:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchMyEvents();
    }
  }, [currentUser?.id]);

  // При кліку на подію в календарі переходимо на її детальну сторінку
  const handleSelectEvent = (event: CalendarEvent) => {
    navigate(`/events/${event.id}`);
  };

  // Налаштування кольорів: сині для своїх подій, зелені для тих, де ми учасники
  const eventStyleGetter = (event: CalendarEvent) => {
    const backgroundColor = event.isOrganizer ? '#4f46e5' : '#059669'; 
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  if (loading) return <div className="text-center mt-10">Завантаження...</div>;

  return (
    <div className="max-w-6xl mx-auto h-[80vh] bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Мій розклад</h1>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-600"></span> Я організатор
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600"></span> Я учасник
          </div>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          <p className="text-xl mb-2">Ви ще не берете участь у жодній події.</p>
          <p>Дослідіть публічні події та приєднуйтесь!</p>
        </div>
      ) : (
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100% - 80px)' }}
          culture="uk"
          messages={{
            next: "Наступний",
            previous: "Попередній",
            today: "Сьогодні",
            month: "Місяць",
            week: "Тиждень",
            day: "День",
            agenda: "Список",
            noEventsInRange: "У цьому періоді немає подій."
          }}
          defaultView={Views.MONTH}
          views={['month', 'week', 'day']}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
        />
      )}
    </div>
  );
}