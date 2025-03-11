import React from 'react';

const WidgetControls = ({ isDebugMode, ...props }) => {
  // Remove the entire controls rendering or just return null
  return null;
  
  // Original code would have been something like:
  /* return (
    <div className="widget-controls">
      <button onClick={props.onTestQuery}>Test Steps Query</button>
      <button onClick={props.onRefreshContent}>Refresh Content</button>
      <button onClick={props.onForceRebuild}>Force Rebuild</button>
      <button onClick={props.onDebug}>Debug</button>
      <button onClick={props.onForceShow}>Force Show</button>
    </div>
  ); */
};

export default WidgetControls;