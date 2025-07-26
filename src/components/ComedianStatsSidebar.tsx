'use client';

import { useMemo } from 'react';

type Assignment = {
  host: string;
  door: string[];
};

interface ComedianStatsSidebarProps {
  availData: string[][];
  assignments: Record<string, Assignment>;
  selectedMonth: string;
}

export function ComedianStatsSidebar({
  availData,
  assignments,
  selectedMonth
}: ComedianStatsSidebarProps) {
  const { unassignedPeople, understaffedShows, allShows, comedianAssignments } = useMemo(() => {
    if (!availData || availData.length === 0 || !selectedMonth) {
      return { unassignedPeople: [], understaffedShows: [], allShows: [], comedianAssignments: [] };
    }

    const header = availData[0] || [];
    const rows = availData.slice(1);
    const nameIdx = header.findIndex(h => h.includes('Your name'));
    const stowawayIdx = header.findIndex(h => h.includes('Stowaway'));
    const citizenIdx = header.findIndex(h => h.includes('Citizen'));

    // Get all shows for the selected month
    const dates = new Set<string>();
    const shows: Array<{ date: string; venue: string }> = [];
    
    for (const row of rows) {
      const stowawayDates = (row[stowawayIdx] || '').split(',').map(d => d.trim());
      const citizenDates = (row[citizenIdx] || '').split(',').map(d => d.trim());
      
      for (const d of stowawayDates) {
        if (d && new Date(d.replace(/^\w+\s+/, '')).toLocaleString('default', { month: 'long', year: 'numeric' }) === selectedMonth) {
          const key = d + '|Stowaway';
          if (!dates.has(key)) {
            shows.push({ date: d, venue: 'Stowaway' });
            dates.add(key);
          }
        }
      }
      for (const d of citizenDates) {
        if (d && new Date(d.replace(/^\w+\s+/, '')).toLocaleString('default', { month: 'long', year: 'numeric' }) === selectedMonth) {
          const key = d + '|Citizen';
          if (!dates.has(key)) {
            shows.push({ date: d, venue: 'Citizen' });
            dates.add(key);
          }
        }
      }
    }
    
    const sortedShows = shows.sort((a, b) => new Date(a.date.replace(/^\w+\s+/, '')).getTime() - new Date(b.date.replace(/^\w+\s+/, '')).getTime());

    // Get all people available in the selected month
    const availablePeople = new Set<string>();
    
    for (const row of rows) {
      const name = row[nameIdx]?.trim();
      if (!name) continue;

      const stowawayDates = (row[stowawayIdx] || '').split(',').map(d => d.trim());
      const citizenDates = (row[citizenIdx] || '').split(',').map(d => d.trim());
      
      // Check if person is available in the selected month
      const hasAvailability = [...stowawayDates, ...citizenDates].some(dateStr => {
        if (!dateStr) return false;
        try {
          const dateMatch = dateStr.match(/\w+\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}\s+\d{4}/);
          if (dateMatch) {
            const monthDayYear = dateMatch[0].replace(/^\w+\s+/, '');
            const date = new Date(monthDayYear);
            if (!isNaN(date.getTime())) {
              const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
              return monthYear === selectedMonth;
            }
          }
        } catch (error) {
          console.error('Error parsing date:', dateStr, error);
        }
        return false;
      });

      if (hasAvailability) {
        availablePeople.add(name);
      }
    }

    // Get all assigned people and their assignments
    const assignedPeople = new Set<string>();
    const comedianShifts: Record<string, Array<{ show: string; role: string }>> = {};
    
    Object.entries(assignments).forEach(([showKey, assignment]) => {
      if (assignment.host) {
        assignedPeople.add(assignment.host);
        if (!comedianShifts[assignment.host]) {
          comedianShifts[assignment.host] = [];
        }
        comedianShifts[assignment.host].push({
          show: showKey,
          role: 'Host'
        });
      }
      assignment.door.forEach(person => {
        assignedPeople.add(person);
        if (!comedianShifts[person]) {
          comedianShifts[person] = [];
        }
        comedianShifts[person].push({
          show: showKey,
          role: 'Door'
        });
      });
    });

    // Convert to sorted array for display
    const comedianAssignmentsList = Object.entries(comedianShifts)
      .map(([name, shifts]) => {
        const hostShifts = shifts.filter(shift => shift.role === 'Host').length;
        const doorShifts = shifts.filter(shift => shift.role === 'Door').length;
        
        return {
          name,
          shifts: shifts.sort((a, b) => a.show.localeCompare(b.show)),
          hostCount: hostShifts,
          doorCount: doorShifts,
          totalCount: shifts.length
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    // Find people who are available but not assigned
    const unassigned = Array.from(availablePeople).filter(person => 
      !assignedPeople.has(person)
    ).sort();

    // Find shows that are not fully staffed
    const understaffed: Array<{
      showKey: string;
      assignment: Assignment;
      missingHost: boolean;
      missingDoor: boolean;
    }> = [];

    sortedShows.forEach(show => {
      const showKey = `${show.date} | ${show.venue}`;
      const assignment = assignments[showKey] || { host: '', door: [] };
      
      const hasHost = assignment.host && assignment.host.trim() !== '';
      const hasDoorPerson = assignment.door.length > 0;
      
      if (!hasHost || !hasDoorPerson) {
        understaffed.push({
          showKey,
          assignment,
          missingHost: !hasHost,
          missingDoor: !hasDoorPerson
        });
      }
    });

    return { 
      unassignedPeople: unassigned, 
      understaffedShows: understaffed,
      allShows: sortedShows,
      comedianAssignments: comedianAssignmentsList
    };
  }, [availData, assignments, selectedMonth]);

  return (
    <div className="space-y-6">
      {/* Comedian Assignments */}
      {comedianAssignments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            👥 Comedian Assignments
            {selectedMonth && (
              <span className="text-sm font-normal text-slate-500 ml-2">
                ({selectedMonth})
              </span>
            )}
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <ul className="space-y-3">
              {comedianAssignments.map(({ name, shifts, hostCount, doorCount, totalCount }) => (
                <li key={name} className="text-sm">
                  <div className="font-medium text-blue-800 mb-1">
                    {name} - {totalCount} shift{totalCount !== 1 ? 's' : ''}{hostCount > 0 ? ` (${hostCount} hosting)` : ''}
                  </div>
                  <ul className="text-blue-600 text-xs space-y-1 ml-3">
                    {shifts.map((shift, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                        <span className="font-medium mr-2">{shift.role}:</span>
                        {shift.show}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Understaffed Shows */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">
          ⚠️ Understaffed Shows
          {selectedMonth && (
            <span className="text-sm font-normal text-slate-500 ml-2">
              ({selectedMonth})
            </span>
          )}
        </h3>
        
        {!selectedMonth ? (
          <p className="text-sm text-slate-500 italic">
            Select a month to see understaffed shows
          </p>
        ) : understaffedShows.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700 flex items-center">
              ✅ All shows are fully staffed!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-slate-600 mb-2">
              {understaffedShows.length} shows need attention:
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <ul className="space-y-2">
                {understaffedShows.map(({ showKey, assignment, missingHost, missingDoor }) => (
                  <li key={showKey} className="text-sm">
                    <div className="font-medium text-red-800 mb-1">
                      {showKey}
                    </div>
                    <div className="text-red-600 text-xs space-y-1">
                      {missingHost && (
                        <div className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
                          Missing host
                        </div>
                      )}
                      {missingDoor && (
                        <div className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
                          Missing door person
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Unassigned People */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">
          🚫 Unassigned People
          {selectedMonth && (
            <span className="text-sm font-normal text-slate-500 ml-2">
              ({selectedMonth})
            </span>
          )}
        </h3>
        
        {!selectedMonth ? (
          <p className="text-sm text-slate-500 italic">
            Select a month to see unassigned people
          </p>
        ) : unassignedPeople.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700 flex items-center">
              ✅ Everyone available has been assigned!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-slate-600 mb-2">
              {unassignedPeople.length} people need assignments:
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <ul className="space-y-1">
                {unassignedPeople.map(person => (
                  <li 
                    key={person} 
                    className="text-sm text-amber-800 flex items-center"
                  >
                    <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                    {person}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
