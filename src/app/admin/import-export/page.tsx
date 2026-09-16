import { SelectiveImportExport } from "@/src/components/admin/SelectiveImportExport";

export default function ImportExportPage() {
  return <main className="flex flex-col gap-6 p-6"><div><h1 className="text-2xl font-semibold">Import & export</h1><p className="text-muted-foreground">Move selected CMS content between environments safely.</p></div><SelectiveImportExport /></main>;
}
