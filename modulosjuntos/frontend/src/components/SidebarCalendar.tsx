import { useState } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import "react-calendar/dist/Calendar.css";

export default function SidebarCalendar() {
  // Solo un día seleccionado
  const [value, setValue] = useState<Date | null>(new Date());

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-8">
      <div className="flex items-center gap-2 mb-4">
        <CalendarIcon className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Calendario</h3>
      </div>
      <Calendar
        onChange={(date) => setValue(date as Date)}
        value={value}
        locale="es"
        className="w-full border-0"
        formatDay={(_locale, date) => format(date, "d")}
        maxDetail="month"
        minDetail="month"
        selectRange={false}
      />
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          {value ? format(value, "EEEE, d 'de' MMMM") : ""}
        </h4>
      </div>
    </div>
  );
} 