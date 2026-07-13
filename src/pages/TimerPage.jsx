import React from 'react';
import TimerViews from '../components/TimerViews';

export default function TimerPage() {
  return (
    <div className="flex-1 flex flex-col relative w-full overflow-hidden">
      <TimerViews asModal={false} />
    </div>
  );
}
