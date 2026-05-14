import { Box, Typography } from '@mui/material'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler)

interface MonthlyData {
  label: string
  amount: number
  count: number
}

interface CategoryData {
  _id: string
  count: number
  totalGoal: number
  totalRaised: number
}

interface StatusData {
  _id: string
  count: number
}

interface FundingTypeData {
  _id: string
  count: number
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
  active: '#3b82f6',
  funded: '#8b5cf6',
  completed: '#6b7280',
}

const CATEGORY_COLORS = ['#6366f1', '#3b82f6', '#0ea5e9', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6']

export function MonthlyInvestmentChart({ data }: { data: MonthlyData[] }) {
  if (!data.length) return <EmptyChart message="No investment data yet" />

  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        label: 'Amount (LKR)',
        data: data.map(d => d.amount),
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        borderColor: '#6366f1',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  return (
    <ChartCard title="Monthly Investment Volume">
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { callback: (v) => `LKR ${Number(v).toLocaleString()}`, font: { size: 11 } },
              grid: { color: '#f3f4f6' },
            },
            x: { ticks: { font: { size: 11 } }, grid: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

export function CategoryBreakdownChart({ data }: { data: CategoryData[] }) {
  if (!data.length) return <EmptyChart message="No project data yet" />

  const chartData = {
    labels: data.map(d => d._id),
    datasets: [
      {
        label: 'Goal',
        data: data.map(d => d.totalGoal),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderRadius: 4,
      },
      {
        label: 'Raised',
        data: data.map(d => d.totalRaised),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 4,
      },
    ],
  }

  return (
    <ChartCard title="Funding by Category">
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top', labels: { font: { size: 11 }, usePointStyle: true, pointStyle: 'circle' } } },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { callback: (v) => `LKR ${(Number(v) / 1000).toFixed(0)}K`, font: { size: 11 } },
              grid: { color: '#f3f4f6' },
            },
            x: { ticks: { font: { size: 11 } }, grid: { display: false } },
          },
        }}
      />
    </ChartCard>
  )
}

export function ProjectStatusChart({ data }: { data: StatusData[] }) {
  if (!data.length) return <EmptyChart message="No project data yet" />

  const chartData = {
    labels: data.map(d => d._id.charAt(0).toUpperCase() + d._id.slice(1)),
    datasets: [
      {
        data: data.map(d => d.count),
        backgroundColor: data.map(d => STATUS_COLORS[d._id] || '#9ca3af'),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  }

  return (
    <ChartCard title="Projects by Status">
      <Box sx={{ maxWidth: 260, mx: 'auto' }}>
        <Doughnut
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: true,
            cutout: '65%',
            plugins: {
              legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12, usePointStyle: true, pointStyle: 'circle' } },
            },
          }}
        />
      </Box>
    </ChartCard>
  )
}

export function FundingTypeChart({ data }: { data: FundingTypeData[] }) {
  if (!data.length) return <EmptyChart message="No project data yet" />

  const chartData = {
    labels: data.map(d => d._id === 'equity' ? 'Equity' : 'Microloan'),
    datasets: [
      {
        data: data.map(d => d.count),
        backgroundColor: ['#8b5cf6', '#3b82f6'],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  }

  return (
    <ChartCard title="Funding Type Split">
      <Box sx={{ maxWidth: 220, mx: 'auto' }}>
        <Doughnut
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: true,
            cutout: '65%',
            plugins: {
              legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12, usePointStyle: true, pointStyle: 'circle' } },
            },
          }}
        />
      </Box>
    </ChartCard>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 2.5, p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#111827', mb: 2 }}>{title}</Typography>
      <Box sx={{ flex: 1, minHeight: 220, position: 'relative' }}>{children}</Box>
    </Box>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 2.5, p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <Box sx={{ py: 6, textAlign: 'center', color: '#9ca3af' }}>
        <Typography sx={{ fontSize: 14 }}>{message}</Typography>
      </Box>
    </Box>
  )
}

export default {
  MonthlyInvestmentChart,
  CategoryBreakdownChart,
  ProjectStatusChart,
  FundingTypeChart,
}
