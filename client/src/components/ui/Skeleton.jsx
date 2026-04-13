import React from 'react';

const Skeleton = ({ width, height, borderRadius = '8px', className = '', style = {} }) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '20px',
        borderRadius,
        ...style
      }}
    />
  );
};

export default Skeleton;
