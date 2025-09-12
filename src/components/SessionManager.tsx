import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppState } from '../context/AppStateContext';
import { format } from 'date-fns';

export function SessionManager() {
  const { state, loadSession, createNewSession, deleteSession } = useAppState();

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Your Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <Button onClick={createNewSession}>New Session</Button>
        </div>
        {state.sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sessions saved yet.</p>
        ) : (
          <ul className="space-y-2">
            {state.sessions.map((session) => (
              <li key={session.id} className="flex justify-between items-center p-2 border rounded-md">
                <div>
                  <p className="font-medium">{session.name}</p>
                  <p className="text-xs text-muted-foreground">Last saved: {format(session.timestamp, 'PPP p')}</p>
                </div>
                <div className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => loadSession(session.id)}>Load</Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteSession(session.id)}>Delete</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
