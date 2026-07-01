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

  it('markClassPresent đánh dấu cả lớp present — không tạo bản ghi trùng', () => {
    const st = useAppStore.getState()
    st.addStudent({ fullName: 'A', className: 'L1', feeMode: 'per_session', fee: 1000, startDate: '2026-07-01', sortOrder: 1 })
    st.addStudent({ fullName: 'B', className: 'L1', feeMode: 'per_session', fee: 1000, startDate: '2026-07-01', sortOrder: 2 })
    const id1 = useAppStore.getState().students[0].id
    const id2 = useAppStore.getState().students[1].id

    // Lần 1: đánh dấu cả 2 học sinh present
    st.markClassPresent([id1, id2], '2026-07-05')
    let att = useAppStore.getState().attendance
    expect(att).toHaveLength(2)
    expect(att.filter(a => a.studentId === id1 && a.date === '2026-07-05' && a.status === 'present')).toHaveLength(1)
    expect(att.filter(a => a.studentId === id2 && a.date === '2026-07-05' && a.status === 'present')).toHaveLength(1)

    // Lần 2: gọi lại cùng ngày cùng ids → không tạo bản ghi trùng
    st.markClassPresent([id1, id2], '2026-07-05')
    att = useAppStore.getState().attendance
    expect(att).toHaveLength(2)
  })

  it('replaceAll thay toàn bộ students và attendance', () => {
    const st = useAppStore.getState()
    st.addStudent({ fullName: 'A', className: 'L1', feeMode: 'per_session', fee: 1000, startDate: '2026-07-01', sortOrder: 1 })
    st.addStudent({ fullName: 'B', className: 'L1', feeMode: 'per_session', fee: 1000, startDate: '2026-07-01', sortOrder: 2 })
    expect(useAppStore.getState().students).toHaveLength(2)

    // Thay toàn bộ bằng 1 student mới
    const newStudent: any = { id: 's_new123', fullName: 'C', className: 'L2', feeMode: 'per_session', fee: 2000, startDate: '2026-07-01', sortOrder: 1 }
    st.replaceAll({ students: [newStudent], attendance: [] })

    expect(useAppStore.getState().students).toHaveLength(1)
    expect(useAppStore.getState().students[0]).toEqual(newStudent)
    expect(useAppStore.getState().attendance).toHaveLength(0)
  })

  it('updateStudent cập nhật các trường của học sinh, giữ nguyên trường khác', () => {
    const st = useAppStore.getState()
    st.addStudent({ fullName: 'A', className: 'L1', feeMode: 'per_session', fee: 1000, startDate: '2026-07-01', sortOrder: 1 })
    const id = useAppStore.getState().students[0].id
    const original = useAppStore.getState().students[0]

    // Cập nhật fullName và fee
    st.updateStudent(id, { fullName: 'Tên Mới', fee: 200000 })
    const updated = useAppStore.getState().students[0]

    expect(updated.fullName).toBe('Tên Mới')
    expect(updated.fee).toBe(200000)
    expect(updated.className).toBe(original.className)
    expect(updated.feeMode).toBe(original.feeMode)
    expect(updated.startDate).toBe(original.startDate)
    expect(updated.sortOrder).toBe(original.sortOrder)
  })

  it('addStudentsBulk thêm nhiều học sinh, mỗi cái được sinh id', () => {
    const st = useAppStore.getState()
    const newStudents = [
      { fullName: 'D', className: 'L1', feeMode: 'per_session', fee: 1000, startDate: '2026-07-01', sortOrder: 1 },
      { fullName: 'E', className: 'L2', feeMode: 'per_session', fee: 1500, startDate: '2026-07-01', sortOrder: 2 }
    ] as any[]

    st.addStudentsBulk(newStudents)

    const students = useAppStore.getState().students
    expect(students).toHaveLength(2)
    expect(students[0].id).toBeTruthy()
    expect(students[1].id).toBeTruthy()
    expect(students[0].id).not.toBe(students[1].id)
    expect(students[0].fullName).toBe('D')
    expect(students[1].fullName).toBe('E')
  })
})
