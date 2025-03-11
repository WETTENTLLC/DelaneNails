import React from 'react';
import WidgetContent from './WidgetContent';
// ...existing code...

const MainWidget = (props) => {
  // ...existing code...

  return (
    <div className="main-widget">
      <WidgetContent {...props} />
      {/* Remove this line:
      <WidgetDebugToolbar onTestQuery={...} onRefresh={...} ... */}
    </div>
  );
};

// ...existing code...
export default MainWidget;
