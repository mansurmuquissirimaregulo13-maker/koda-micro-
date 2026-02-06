import React from 'react';
import { CreditStatus, getStatusLabel, getStatusColor } from '../utils/helpers';
interface CreditStatusBadgeProps {
  status: CreditStatus;
}
export function CreditStatusBadge({ status }: CreditStatusBadgeProps) {
  return (
    <span
      className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
      ${getStatusColor(status)}
    `}>

      {getStatusLabel(status)}
    </span>);

}