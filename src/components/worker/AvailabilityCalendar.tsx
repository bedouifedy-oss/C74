'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  X,
  Calendar,
  Sun,
  Sunset,
  Moon,
  Loader2,
  Save,
} from 'lucide-react';
import type { Locale } from '@/i18n-routing';

const translations = {
  en: {
    title: 'Availability',
    subtitle: 'Set your available times for jobs',
    
    // Days
    sunday: 'Sun',
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    
    // Full days
    sundayFull: 'Sunday',
    mondayFull: 'Monday',
    tuesdayFull: 'Tuesday',
    wednesdayFull: 'Wednesday',
    thursdayFull: 'Thursday',
    fridayFull: 'Friday',
    saturdayFull: 'Saturday',
    
    // Time slots
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    morningTime: '8:00 - 12:00',
    afternoonTime: '12:00 - 17:00',
    eveningTime: '17:00 - 21:00',
    
    // Actions
    available: 'Available',
    unavailable: 'Unavailable',
    setAvailable: 'Mark Available',
    setUnavailable: 'Mark Unavailable',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    saved: 'Saved!',
    
    // Status
    selectDays: 'Select days and time slots',
    noSelection: 'Click on time slots to toggle availability',
    
    // Quick actions
    quickActions: 'Quick Actions',
    markWeekAvailable: 'Available All Week',
    markWeekendOff: 'Weekends Off',
    clearAll: 'Clear All',
  },
  fr: {
    title: 'Disponibilité',
    subtitle: 'Définissez vos heures disponibles',
    
    sunday: 'Dim',
    monday: 'Lun',
    tuesday: 'Mar',
    wednesday: 'Mer',
    thursday: 'Jeu',
    friday: 'Ven',
    saturday: 'Sam',
    
    sundayFull: 'Dimanche',
    mondayFull: 'Lundi',
    tuesdayFull: 'Mardi',
    wednesdayFull: 'Mercredi',
    thursdayFull: 'Jeudi',
    fridayFull: 'Vendredi',
    saturdayFull: 'Samedi',
    
    morning: 'Matin',
    afternoon: 'Après-midi',
    evening: 'Soir',
    morningTime: '8:00 - 12:00',
    afternoonTime: '12:00 - 17:00',
    eveningTime: '17:00 - 21:00',
    
    available: 'Disponible',
    unavailable: 'Indisponible',
    setAvailable: 'Marquer disponible',
    setUnavailable: 'Marquer indisponible',
    saveChanges: 'Enregistrer',
    saving: 'Enregistrement...',
    saved: 'Enregistré !',
    
    selectDays: 'Sélectionnez les jours et créneaux',
    noSelection: 'Cliquez sur les créneaux pour modifier',
    
    quickActions: 'Actions rapides',
    markWeekAvailable: 'Toute la semaine',
    markWeekendOff: 'Week-ends libres',
    clearAll: 'Tout effacer',
  },
  'ar-TN': {
    title: 'التوفر',
    subtitle: 'حدد أوقات توفرك للعمل',
    
    sunday: 'أحد',
    monday: 'إثن',
    tuesday: 'ثلا',
    wednesday: 'أرب',
    thursday: 'خمي',
    friday: 'جمع',
    saturday: 'سبت',
    
    sundayFull: 'الأحد',
    mondayFull: 'الإثنين',
    tuesdayFull: 'الثلاثاء',
    wednesdayFull: 'الأربعاء',
    thursdayFull: 'الخميس',
    fridayFull: 'الجمعة',
    saturdayFull: 'السبت',
    
    morning: 'الصباح',
    afternoon: 'بعد الظهر',
    evening: 'المساء',
    morningTime: '8:00 - 12:00',
    afternoonTime: '12:00 - 17:00',
    eveningTime: '17:00 - 21:00',
    
    available: 'متوفر',
    unavailable: 'غير متوفر',
    setAvailable: 'حدد متوفر',
    setUnavailable: 'حدد غير متوفر',
    saveChanges: 'حفظ التغييرات',
    saving: 'جاري الحفظ...',
    saved: 'تم الحفظ!',
    
    selectDays: 'اختر الأيام والأوقات',
    noSelection: 'انقر على الأوقات للتبديل',
    
    quickActions: 'إجراءات سريعة',
    markWeekAvailable: 'كامل الأسبوع',
    markWeekendOff: 'عطلة نهاية الأسبوع',
    clearAll: 'مسح الكل',
  },
};

type TimeSlot = 'morning' | 'afternoon' | 'evening';
type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface AvailabilitySlot {
  day: DayOfWeek;
  slot: TimeSlot;
}

interface AvailabilityCalendarProps {
  locale: Locale;
  workerId?: string;
  onSave?: (availability: AvailabilitySlot[]) => Promise<void>;
}

const timeSlotIcons: Record<TimeSlot, React.ReactNode> = {
  morning: <Sun className="w-4 h-4" />,
  afternoon: <Sunset className="w-4 h-4" />,
  evening: <Moon className="w-4 h-4" />,
};

export default function AvailabilityCalendar({ locale, workerId, onSave }: AvailabilityCalendarProps) {
  const t = translations[locale];

  const [availability, setAvailability] = useState<Set<string>>(new Set());
  const [effectiveWorkerId, setEffectiveWorkerId] = useState<string | undefined>(workerId);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    return new Date(today.setDate(diff));
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const days: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];
  const timeSlots: TimeSlot[] = ['morning', 'afternoon', 'evening'];

  const dayLabels: Record<DayOfWeek, string> = {
    0: t.sunday,
    1: t.monday,
    2: t.tuesday,
    3: t.wednesday,
    4: t.thursday,
    5: t.friday,
    6: t.saturday,
  };

  const dayFullLabels: Record<DayOfWeek, string> = {
    0: t.sundayFull,
    1: t.mondayFull,
    2: t.tuesdayFull,
    3: t.wednesdayFull,
    4: t.thursdayFull,
    5: t.fridayFull,
    6: t.saturdayFull,
  };

  const slotLabels: Record<TimeSlot, string> = {
    morning: t.morning,
    afternoon: t.afternoon,
    evening: t.evening,
  };

  const slotTimes: Record<TimeSlot, string> = {
    morning: t.morningTime,
    afternoon: t.afternoonTime,
    evening: t.eveningTime,
  };

  // Load initial availability
  useEffect(() => {
    if (!workerId) {
      try {
        const userData = localStorage.getItem('user_data');
        const user = userData ? JSON.parse(userData) : null;
        setEffectiveWorkerId(user?.id || undefined);
      } catch {
        setEffectiveWorkerId(undefined);
      }
    } else {
      setEffectiveWorkerId(workerId);
    }
  }, [workerId]);

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        const token = localStorage.getItem('auth_token');

        const url = effectiveWorkerId
          ? `/api/workers/availability?workerId=${effectiveWorkerId}`
          : '/api/workers/availability';

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 Availability API Response:', data);
          console.log('🔍 data.availability:', data.availability);
          
          if (data.availability) {
            console.log('🔍 Processing availability data:', data.availability);
            const slots = new Set<string>(
              data.availability.map((a: AvailabilitySlot) => `${a.day}-${a.slot}`)
            );
            console.log('🔍 Processed slots:', slots);
            setAvailability(slots);
          } else {
            console.log('🔍 No availability data in response');
          }
        } else {
          console.log('🔍 API Response not OK:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error loading availability:', error);
        // Set default availability (weekdays, all slots)
        const defaultSlots = new Set<string>();
        [1, 2, 3, 4, 5].forEach(day => {
          timeSlots.forEach(slot => {
            defaultSlots.add(`${day}-${slot}`);
          });
        });
        setAvailability(defaultSlots);
      }
    };

    loadAvailability();
  }, [effectiveWorkerId]);

  const getSlotKey = (day: DayOfWeek, slot: TimeSlot) => `${day}-${slot}`;

  const toggleSlot = (day: DayOfWeek, slot: TimeSlot) => {
    console.log('🔍 toggleSlot called:', { day, slot, hasChanges });
    const key = getSlotKey(day, slot);
    setAvailability(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        console.log('🔍 Removed slot:', key);
      } else {
        next.add(key);
        console.log('🔍 Added slot:', key);
      }
      return next;
    });
    setHasChanges(true);
    setSaveMessage(null);
    console.log('🔍 setHasChanges(true) - Button should be enabled');
  };

  const isAvailable = (day: DayOfWeek, slot: TimeSlot) => {
    return availability.has(getSlotKey(day, slot));
  };

  const getDateForDay = (dayOfWeek: DayOfWeek): Date => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + dayOfWeek);
    return date;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() + (direction === 'next' ? 7 : -7));
      return next;
    });
  };

  const handleSave = async () => {
    console.log('🔍 handleSave called:', { isSaving, hasChanges, availability: Array.from(availability) });
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const slots: AvailabilitySlot[] = Array.from(availability).map(key => {
        const [day, slot] = key.split('-');
        return { day: parseInt(day) as DayOfWeek, slot: slot as TimeSlot };
      });

      console.log('🔍 Prepared slots for API:', slots);

      if (onSave) {
        console.log('🔍 Using onSave callback');
        await onSave(slots);
      } else {
        console.log('🔍 Using API call');
        const token = localStorage.getItem('auth_token');
        console.log('🔍 Token exists:', !!token);
        console.log('🔍 Worker ID:', effectiveWorkerId);
        
        const response = await fetch('/api/workers/availability', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ workerId: effectiveWorkerId, availability: slots }),
        });
        
        console.log('🔍 API Response status:', response.status);
        console.log('🔍 API Response ok:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('🔍 API Error:', errorText);
        }
      }

      setSaveMessage(t.saved);
      setHasChanges(false);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('🔍 Error saving availability:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Quick actions
  const markWeekAvailable = () => {
    const slots = new Set<string>();
    [1, 2, 3, 4, 5].forEach(day => {
      timeSlots.forEach(slot => {
        slots.add(`${day}-${slot}`);
      });
    });
    setAvailability(slots);
    setHasChanges(true);
  };

  const markWeekendOff = () => {
    setAvailability(prev => {
      const next = new Set(prev);
      [0, 6].forEach(day => {
        timeSlots.forEach(slot => {
          next.delete(`${day}-${slot}`);
        });
      });
      return next;
    });
    setHasChanges(true);
  };

  const clearAll = () => {
    setAvailability(new Set());
    setHasChanges(true);
  };

  const formatWeekRange = () => {
    const start = new Date(currentWeekStart);
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const localeStr = locale === 'ar-TN' ? 'ar-TN' : locale === 'fr' ? 'fr-FR' : 'en-US';
    
    return `${start.toLocaleDateString(localeStr, options)} - ${end.toLocaleDateString(localeStr, options)}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className={`flex items-center justify-between`}>
          <div>
            <CardTitle className={`flex items-center gap-2`}>
              <Calendar className="w-5 h-5" />
              {t.title}
            </CardTitle>
            <CardDescription>{t.subtitle}</CardDescription>
          </div>
          
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className={`flex items-center gap-2`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.saving}
              </>
            ) : saveMessage ? (
              <>
                <Check className="w-4 h-4" />
                {saveMessage}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t.saveChanges}
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Week Navigation */}
        <div className={`flex items-center justify-between mb-6`}>
          <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          </Button>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {formatWeekRange()}
          </span>
          <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className={`flex gap-2 mb-6 flex-wrap`}>
          <Button variant="outline" size="sm" onClick={markWeekAvailable}>
            {t.markWeekAvailable}
          </Button>
          <Button variant="outline" size="sm" onClick={markWeekendOff}>
            {t.markWeekendOff}
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll}>
            {t.clearAll}
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-start"></th>
                {days.map(day => {
                  const date = getDateForDay(day);
                  const isToday = new Date().toDateString() === date.toDateString();
                  return (
                    <th key={day} className="p-2 text-center min-w-[80px]">
                      <div className={`${isToday ? 'text-primary-600 font-bold' : 'text-neutral-600 dark:text-neutral-400'}`}>
                        {dayLabels[day]}
                      </div>
                      <div className={`text-xs ${isToday ? 'text-primary-600' : 'text-neutral-400'}`}>
                        {date.getDate()}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(slot => (
                <tr key={slot}>
                  <td className="p-2">
                    <div className={`flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300`}>
                      {timeSlotIcons[slot]}
                      <div>
                        <div>{slotLabels[slot]}</div>
                        <div className="text-xs text-neutral-400" dir="ltr">{slotTimes[slot]}</div>
                      </div>
                    </div>
                  </td>
                  {days.map(day => {
                    const available = isAvailable(day, slot);
                    return (
                      <td key={`${day}-${slot}`} className="p-1">
                        <button
                          onClick={() => toggleSlot(day, slot)}
                          className={`w-full h-12 rounded-lg border-2 transition-all flex items-center justify-center ${
                            available
                              ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400'
                              : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:border-neutral-300'
                          }`}
                        >
                          {available ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <X className="w-5 h-5 opacity-30" />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className={`mt-6 flex items-center gap-6 text-sm`}>
          <div className={`flex items-center gap-2`}>
            <div className="w-6 h-6 rounded border-2 bg-green-100 border-green-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-green-700" />
            </div>
            <span className="text-neutral-600 dark:text-neutral-400">{t.available}</span>
          </div>
          <div className={`flex items-center gap-2`}>
            <div className="w-6 h-6 rounded border-2 bg-neutral-50 border-neutral-200 flex items-center justify-center">
              <X className="w-3 h-3 text-neutral-400 opacity-30" />
            </div>
            <span className="text-neutral-600 dark:text-neutral-400">{t.unavailable}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
