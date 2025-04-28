import React from 'react';
import { Group, Title, Avatar } from '@mantine/core';

interface DashboardHeaderProps {
  /**
   * The username to be displayed in the header.
   */
  userName: string;
  /**
   * The subtitle to be displayed below the username.
   */
  subtitle: string;
}

/**
 * DashboardHeader: Uses global styles for perfect brand match
 * 
 * A header component that displays a welcome message with the user's name and an avatar.
 * 
 * @param {DashboardHeaderProps} props - The component props.
 * @param {string} props.userName - The username to be displayed.
 * @param {string} props.subtitle - The subtitle to be displayed below the username.
 */
const DashboardHeader = ({ userName, subtitle }: DashboardHeaderProps) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
      <div>
        <h2 style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 28, marginBottom: 2 }}>
          Welcome, {userName}!
        </h2>
        {subtitle && <div style={{ color: 'var(--text-muted)', fontSize: 16 }}>{subtitle}</div>}
      </div>
      <div style={{ background: 'var(--surface-color)', borderRadius: '50%', boxShadow: 'var(--shadow-md)', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, color: 'var(--primary-color)' }}>
        {userName[0]}
      </div>
    </div>
  );
};

export default DashboardHeader;
