import { Chip } from '@mui/material'

const STATUS_COLOR: Record<string, 'default' | 'warning' | 'success' | 'error' | 'info' | 'primary'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  funded: 'primary',
  active: 'success',
  completed: 'info',
}

interface StatusChipProps {
  status: string
  size?: 'small' | 'medium'
}

export default function StatusChip({ status, size = 'small' }: StatusChipProps) {
  return (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      color={STATUS_COLOR[status] ?? 'default'}
      size={size}
      sx={{ fontWeight: 700 }}
    />
  )
}
