'use client';

import { useState, useMemo, Dispatch, SetStateAction } from 'react';

type Assignment = {
  host: string;
  door: string[];
};

type Show = {
  date: string;
  venue: string;
};

// Add the new props to the interface
interface ShowAssignmentTableProps {
  availData: string[][];
  selectedMonth: string;
  assignments: Record<string, Assignment>;
  setAssignments: Dispatch<SetStateAction<Record<string, Assignment>>>;
}

export function ShowAssignmentTable({ 
  availData, 
  selectedMonth, 
  assignments, 
  setAssignments 
}: ShowAssignmentTableProps) {
  const header = availData[0] || [];
  const rows = availData.slice(1);

  const stowawayIdx = header.findIndex(h => h.includes('Stowaway'));
  const citizenIdx = header.findIndex(h => h.includes('Citizen'));
  const hostIdx = header.findIndex(h => h.includes('host'));
  const nameIdx = header.findIndex(h => h.includes('Your name'));

  const allShows: Show[] = useMemo(() => {
    const dates = new Set<string>();
    const shows: Show[] = [];
    for (const row of rows) {
      const name = row[nameIdx]?.trim();
      const stowawayDates = (row[stowawayIdx] || '').split(',').map(d => d.trim());
      const citizenDates = (row[citizenIdx] || '').split(',').map(d => d.trim());
      for (const d of stowawayDates) {
        if (d && new Date(d).toLocaleString('default', { month: 'long', year: 'numeric' }) === selectedMonth) {
          const key = d + '|Stowaway';
          if (!dates.has(key)) {
            shows.push({ date: d, venue: 'Stowaway' });
            dates.add(key);
          }
        }
      }
      for (const d of citizenDates) {
        if (d && new Date(d).toLocaleString('default', { month: 'long', year: 'numeric' }) === selectedMonth) {
          const key = d + '|Citizen';
          if (!dates.has(key)) {
            shows.push({ date: d, venue: 'Citizen' });
            dates.add(key);
          }
        }
      }
    }
    return shows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [rows, selectedMonth]);

  const people = rows.map(row => ({
    name: row[nameIdx]?.trim(),
    canHost: row[hostIdx]?.toLowerCase() === 'yes',
    stowaway: (row[stowawayIdx] || '').split(',').map(d => d.trim()),
    citizen: (row[citizenIdx] || '').split(',').map(d => d.trim()),
  }));

  const handleChange = (key: string, role: 'host' | 'door', value: string | string[]) => {
    setAssignments(prev => {
      const newAssignments = { ...prev };
      
      if (role === 'host') {
        const hostName = value as string;
        
        // If selecting a host, remove them from door assignments for this show
        if (hostName && newAssignments[key]?.door.includes(hostName)) {
          newAssignments[key] = {
            ...newAssignments[key],
            door: newAssignments[key].door.filter(person => person !== hostName)
          };
        }
        
        newAssignments[key] = {
          host: hostName,
          door: newAssignments[key]?.door || [],
        };
      } else {
        // role === 'door'
        const doorPeople = value as string[];
        const currentHost = newAssignments[key]?.host || '';
        
        // Filter out the current host from door selections
        const filteredDoorPeople = doorPeople.filter(person => person !== currentHost);
        
        newAssignments[key] = {
          host: currentHost,
          door: filteredDoorPeople,
        };
      }
      
      return newAssignments;
    });
  };

  const handleDoorCheckboxChange = (showKey: string, person: string, isChecked: boolean) => {
    const currentDoorPeople = assignments[showKey]?.door || [];
    
    let newDoorPeople: string[];
    if (isChecked) {
      // Add person if not already in the list and under the limit of 2
      if (!currentDoorPeople.includes(person) && currentDoorPeople.length < 2) {
        newDoorPeople = [...currentDoorPeople, person];
      } else {
        newDoorPeople = currentDoorPeople;
      }
    } else {
      // Remove person from the list
      newDoorPeople = currentDoorPeople.filter(p => p !== person);
    }
    
    handleChange(showKey, 'door', newDoorPeople);
  };

  return (
    <div className="space-y-6">
      {allShows.map(show => {
        const key = `${show.date} | ${show.venue}`;
        const available = people.filter(p =>
          (show.venue === 'Stowaway' ? p.stowaway.includes(show.date) : p.citizen.includes(show.date))
        );
        const hostOptions = available.filter(p => p.canHost);
        const currentHost = assignments[key]?.host || '';
        const currentDoorPeople = assignments[key]?.door || [];
        
        // Filter out the current host from door options
        const doorOptions = available.filter(p => p.name !== currentHost);

        return (
          <div key={key} className="border border-slate-200 rounded-xl shadow-md bg-white px-6 py-5 space-y-4">
            <div className="text-lg font-semibold text-slate-800">
              {show.date} @ {show.venue}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Host</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={assignments[key]?.host || ''}
                onChange={e => handleChange(key, 'host', e.target.value)}
              >
                <option value="">-- Select Host --</option>
                {hostOptions.map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-3">
                Door (max 2)
                {currentHost && (
                  <span className="text-xs text-amber-600 ml-2">
                    ⚠️ Host ({currentHost}) excluded from door options
                  </span>
                )}
              </label>
              
              <div className="space-y-2 max-h-48 overflow-y-auto bg-slate-50 rounded-lg p-3 border border-slate-200">
                {doorOptions.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No available door people</p>
                ) : (
                  doorOptions.map(person => {
                    const isChecked = currentDoorPeople.includes(person.name);
                    const isDisabled = !isChecked && currentDoorPeople.length >= 2;
                    
                    return (
                      <label 
                        key={person.name}
                        className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors ${
                          isChecked 
                            ? 'bg-blue-100 border border-blue-200' 
                            : isDisabled 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-white border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={(e) => handleDoorCheckboxChange(key, person.name, e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className={`text-sm ${isDisabled ? 'text-slate-400' : 'text-slate-700'}`}>
                          {person.name}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
              
              {currentDoorPeople.length > 0 && (
                <div className="mt-2 text-xs text-slate-600">
                  Selected: {currentDoorPeople.join(', ')} ({currentDoorPeople.length}/2)
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
