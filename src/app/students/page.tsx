import { StudentList } from '@/components/students/StudentList'
import { StudentForm } from '@/components/students/StudentForm'
import { ImportExportButtons } from '@/components/students/ImportExportButtons'
import { BulkImportDialog } from '@/components/students/BulkImportDialog'

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-heading text-2xl font-bold text-[#c2185b]">Quản lý học sinh</h1>
        <div className="flex flex-wrap gap-2">
          <StudentForm trigger={<button className="candy-btn">➕ Thêm học sinh</button>} />
          <BulkImportDialog />
          <ImportExportButtons />
        </div>
      </div>
      <StudentList />
    </div>
  )
}
