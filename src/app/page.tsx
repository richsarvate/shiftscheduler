'use client';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ShowAssignmentTable } from '@/components/ShowAssignmentTable';
import { ComedianStatsSidebar } from '../components/ComedianStatsSidebar';

// Helper function to convert names to title case
function toTitleCase(str: string): string {
  if (!str) return str;
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();
}

function extractMonths(data: string[][]): string[] {
  const header = data[0];
  const stowawayCol = header.find(h => h && h.includes('Stowaway'));
  const citizenCol = header.find(h => h && h.includes('Citizen'));
  const stowawayIdx = header.indexOf(stowawayCol || '');
  const citizenIdx = header.indexOf(citizenCol || '');

  const dates: string[] = [];

  for (let i = 1; i < data.length; i++) {
    const entries = [data[i][stowawayIdx] || '', data[i][citizenIdx] || ''];
    entries.forEach(entry => {
      if (entry) {
        entry.split(',').forEach(dateStr => {
          const trimmed = dateStr.trim();
          const dateMatch = trimmed.match(/\w+\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}\s+\d{4}/);
          if (dateMatch) {
            const monthDayYear = dateMatch[0].replace(/^\w+\s+/, '');
            const date = new Date(monthDayYear);
            if (!isNaN(date.getTime())) {
              const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
              dates.push(monthYear);
            }
          }
        });
      }
    });
  }

  return [...new Set(dates)].sort();
}

// Function to normalize data with title case names
function normalizeData(data: string[][]): string[][] {
  if (!data || data.length === 0) return data;
  
  const header = data[0];
  const nameIdx = header.findIndex(h => h.includes('Your name'));
  
  if (nameIdx === -1) return data;
  
  return data.map((row, index) => {
    if (index === 0) return row; // Skip header row
    
    return row.map((cell, cellIndex) => {
      if (cellIndex === nameIdx && cell) {
        return toTitleCase(cell);
      }
      return cell;
    });
  });
}

// Local Storage keys
const STORAGE_KEYS = {
  ASSIGNMENTS: 'shift-scheduler-assignments',
  SELECTED_MONTH: 'shift-scheduler-selected-month'
};

export default function Home() {
  const [availData, setAvailData] = useState<string[][]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<Record<string, { host: string; door: string[] }>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load saved data from localStorage on component mount
  useEffect(() => {
    try {
      const savedAssignments = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      const savedSelectedMonth = localStorage.getItem(STORAGE_KEYS.SELECTED_MONTH);
      
      if (savedAssignments) {
        setAssignments(JSON.parse(savedAssignments));
      }
      
      if (savedSelectedMonth) {
        setSelectedMonth(savedSelectedMonth);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Save assignments to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && Object.keys(assignments).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
      } catch (error) {
        console.error('Error saving assignments:', error);
      }
    }
  }, [assignments, isLoading]);

  // Save selected month to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading && selectedMonth) {
      try {
        localStorage.setItem(STORAGE_KEYS.SELECTED_MONTH, selectedMonth);
      } catch (error) {
        console.error('Error saving selected month:', error);
      }
    }
  }, [selectedMonth, isLoading]);

  // Fetch data from API
  useEffect(() => {
    fetch('/api/availabilities')
      .then(res => res.json())
      .then(data => {
        // Normalize the data to ensure consistent name formatting
        const normalizedData = normalizeData(data);
        setAvailData(normalizedData);
        const months = extractMonths(normalizedData);
        setAvailableMonths(months);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      });
  }, []);

  // Handle month selection change
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                🎭 Shift Scheduler
              </h1>
              <p className="text-slate-600 mt-1">Manage comedy show assignments with ease</p>
            </div>
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-slate-700">📅 Select Month:</label>
              <select
                className="bg-white border border-slate-300 rounded-lg px-4 py-2 pr-8 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-900 min-w-[180px]"
                value={selectedMonth}
                onChange={e => handleMonthChange(e.target.value)}
              >
                <option value="" className="text-slate-500">-- Select Month --</option>
                {availableMonths.map(month => (
                  <option key={month} value={month} className="text-slate-900">{month}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/60 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  📋 Show Assignments
                  {selectedMonth && (
                    <span className="ml-3 text-sm bg-white/20 px-3 py-1 rounded-full text-slate-100">
                      {selectedMonth}
                    </span>
                  )}
                </h2>
              </div>
              <div className="p-6">
                <ShowAssignmentTable
                  availData={availData}
                  selectedMonth={selectedMonth}
                  assignments={assignments}
                  setAssignments={setAssignments}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/60 overflow-hidden sticky top-32">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  📊 Stats
                </h2>
              </div>
              <div className="p-6">
                <ComedianStatsSidebar 
                  availData={availData}
                  assignments={assignments}
                  selectedMonth={selectedMonth}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-sm">
          Built with ❤️ for comedy scheduling • Powered by Next.js & Tailwind CSS
        </div>
      </div>
    </div>
  );
}
