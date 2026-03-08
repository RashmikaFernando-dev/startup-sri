import { Box, LinearProgress, Typography } from '@mui/material'

interface FundingProgressProps {
  currentFunding: number
  fundingGoal: number
  /** Show the percentage label above the bar. Defaults to false. */
  showLabel?: boolean
}

export default function FundingProgress({ currentFunding, fundingGoal, showLabel = false }: FundingProgressProps) {
  const pct = Math.min(Math.round(((currentFunding || 0) / fundingGoal) * 100), 100)
  return (
    <Box>
      {showLabel && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            LKR {currentFunding.toLocaleString()} raised
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#0a1940' }}>
            {pct}%
          </Typography>
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 5, borderRadius: 3,
          bgcolor: '#f3f4f6',
          '& .MuiLinearProgress-bar': { bgcolor: '#0a1940' },
        }}
      />
    </Box>
  )
}
