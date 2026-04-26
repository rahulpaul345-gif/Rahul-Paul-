export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string };
  end: { dateTime: string };
}

export const getEvents = async (accessToken: string): Promise<CalendarEvent[]> => {
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=' + new Date().toISOString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.items || [];
};

export const addEvent = async (accessToken: string, event: Omit<CalendarEvent, 'id'>) => {
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data;
};
