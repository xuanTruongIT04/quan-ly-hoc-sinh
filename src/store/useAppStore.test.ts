import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from './useAppStore'

beforeEach(() => {
  useAppStore.setState({ students: [], attendance: [] })
})

describe('useAppStore', () => {
  it('addStudent sinh id và thêm vào danh sách', () => {
    useAppStore.getState().addStudent({ fullName: 'A', className: 'L1', feeMode: 'per_session', fee: 1000, startDate: '2026-07-01', sortOrder: 1 })
    const s = useAppStore.getState().students
    expect(s).toHaveLength(1)
    expect(s[0].id).toBeTruthy()
  })

  it('removeStudent xóa cả attendance của học sinh đó', () => {
    const st = useAppStore.getState()
    st.addStudent({ fullName: 'A', className: 'L1', feeMode: 'per_session', fee: 1000, startDate: '2026-07-01', sortOrder: 1 })
    const id = useAppStore.getState().students[0].id
    st.setAttendance(id, '2026-07-01', 'present')
    st.removeStudent(id)
    expect(useAppStore.getState().students).toHaveLength(0)
    expect(useAppStore.getState().attendance.filter(a => a.studentId === id)).toHaveLength(0)
  })

  it('setAttendance upsert — đổi trạng thái cùng ngày không tạo bản ghi trùng', () => {
    const st = useAppStore.getState()
    st.addStudent({ fullName: 'A', className: 'L1', feeMode: 'per_session', fee: 1000, startDate: '2026-07-01', sortOrder: 1 })
    const id = useAppStore.getState().students[0].id
    st.setAttendance(id, '2026-07-01', 'present')
    st.setAttendance(id, '2026-07-01', 'absent')
    const recs = useAppStore.getState().attendance.filter(a => a.studentId === id && a.date === '2026-07-01')
    expect(recs).toHaveLength(1)
    expect(recs[0].status).toBe('absent')
  })

  it('classNames trả về danh sách lớp distinct', () => {
    const st = useAppStore.getState()
    st.addStudent({ fullName: 'A', className: 'L1', feeMode: 'per_session', fee: 1000, startDate: '2026-07-01', sortOrder: 1 })
    st.addStudent({ fullName: 'B', className: 'L1', feeMode: 'per_session', fee: 1000, startDate: '2026-07-01', sortOrder: 2 })
    st.addStudent({ fullName: 'C', className: 'L2', feeMode: 'per_session', fee: 1000, startDate: '2026-07-01', sortOrder: 3 })
    expect(useAppStore.getState().classNames().sort()).toEqual(['L1', 'L2'])
  })
})
