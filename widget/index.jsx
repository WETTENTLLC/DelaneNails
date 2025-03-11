import React from 'react';
import WidgetContent from './WidgetContent';

const Widget = (props) => {
  const showDebugControls = false; // Force this to false
  
  return (
    <div className="widget-wrapper">
      <WidgetContent {...widgetProps} />
      {/* Remove or comment out any conditional rendering of debug tools:
      {showDebugControls && <DebugToolbar {...debugProps} />} 
      */}
    </div>
  );
};

export default Widget;
