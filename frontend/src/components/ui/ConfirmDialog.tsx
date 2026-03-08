import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'

interface ConfirmDialogProps {
  open: boolean
  title: string
  body: string
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmDialog({ open, title, body, onConfirm, onClose }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
      <DialogTitle sx={{ fontWeight: 800, color: '#0a1940' }}>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">{body}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => { onConfirm(); onClose() }}
          sx={{ bgcolor: '#0a1940', borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )
}
