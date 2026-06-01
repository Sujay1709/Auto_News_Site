import React from 'react';

export default function SafeIcon({ icon: Icon, className, size = 24 }) {
  if (!Icon) return null;
  return <Icon className={className} size={size} />;
}